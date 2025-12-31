import { db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

/** ========== Helpers ========== */
export async function fetchRoomsForType({ hotelId, roomTypeId }) {
  const q = query(
    collection(db, "rooms"),
    where("hotelId", "==", hotelId),
    where("roomTypeId", "==", roomTypeId),
    where("status", "==", "CLEAN")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** ========== Reception ========== */

// 1) bookings that need room allocation (roomId == null)
export async function fetchUnassignedBookings({ hotelId }) {
  const q = query(
    collection(db, "bookings"),
    where("hotelId", "==", hotelId),
    where("status", "==", "CONFIRMED"),
    where("roomId", "==", null)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// 2) bookings that already have a room assigned (roomId != null)
export async function fetchAssignedBookings({ hotelId }) {
  const q = query(
    collection(db, "bookings"),
    where("hotelId", "==", hotelId)
  );

  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Filter in JS (assignment-safe)
  return list.filter(
    (b) =>
      b.roomId !== null &&
      ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"].includes(b.status)
  );
}


export async function allocateRoomToBooking({ bookingId, roomId, actorUid, hotelId }) {
  await updateDoc(doc(db, "bookings", bookingId), {
    roomId,
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });

  await addDoc(collection(db, "auditLogs"), {
    actorUid,
    action: "ROOM_ALLOCATION",
    targetType: "booking",
    targetId: bookingId,
    timestamp: serverTimestamp(),
    metadata: { roomId, hotelId },
  });
}

export async function checkIn({ bookingId, roomId, actorUid, hotelId, guestUserId }) {
  await updateDoc(doc(db, "bookings", bookingId), {
    status: "CHECKED_IN",
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });

  // mark room DIRTY (occupied/in use) - simplified
  await updateDoc(doc(db, "rooms", roomId), {
    status: "DIRTY",
  });

  await addDoc(collection(db, "auditLogs"), {
    actorUid,
    action: "CHECK_IN",
    targetType: "booking",
    targetId: bookingId,
    timestamp: serverTimestamp(),
    metadata: { roomId, hotelId },
  });

  await addDoc(collection(db, "notifications"), {
    userId: guestUserId,
    hotelId,
    title: "Checked In",
    message: "Welcome! Your check-in has been completed.",
    type: "BOOKING_STATUS",
    status: "UNREAD",
    createdAt: serverTimestamp(),
  });
}

export async function checkOut({ bookingId, roomId, actorUid, hotelId, guestUserId }) {
  await updateDoc(doc(db, "bookings", bookingId), {
    status: "CHECKED_OUT",
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });

  await updateDoc(doc(db, "rooms", roomId), {
    status: "DIRTY",
  });

  // auto housekeeping request
  await addDoc(collection(db, "serviceRequests"), {
    hotelId,
    userId: guestUserId,
    bookingId,
    type: "HOUSEKEEPING",
    assignedRole: "housekeeping",
    assignedToUid: null,
    status: "NEW",
    message: "Auto request: clean room after check-out.",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: actorUid,
    updatedBy: actorUid,
  });

  await addDoc(collection(db, "auditLogs"), {
    actorUid,
    action: "CHECK_OUT",
    targetType: "booking",
    targetId: bookingId,
    timestamp: serverTimestamp(),
    metadata: { roomId, hotelId },
  });

  await addDoc(collection(db, "notifications"), {
    userId: guestUserId,
    hotelId,
    title: "Checked Out",
    message: "Thank you for staying with Seven. Check-out completed.",
    type: "BOOKING_STATUS",
    status: "UNREAD",
    createdAt: serverTimestamp(),
  });
}

/** ========== Housekeeping ========== */

export async function fetchDirtyAndMaintenanceRooms({ hotelId }) {
  // simplest approach: fetch DIRTY, and later optionally MAINTENANCE
  const q = query(collection(db, "rooms"), where("hotelId", "==", hotelId));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return list.filter((r) => ["DIRTY", "MAINTENANCE"].includes(r.status));
}

export async function setRoomStatus({ roomId, newStatus, actorUid, hotelId }) {
  await updateDoc(doc(db, "rooms", roomId), {
    status: newStatus,
  });

  await addDoc(collection(db, "auditLogs"), {
    actorUid,
    action: "ROOM_STATUS_UPDATE",
    targetType: "room",
    targetId: roomId,
    timestamp: serverTimestamp(),
    metadata: { newStatus, hotelId },
  });
}
