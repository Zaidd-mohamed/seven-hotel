import { db } from "../firebase/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  addDoc,
} from "firebase/firestore";

/* =========================
   RECEPTIONIST
========================= */

// Load bookings needing room allocation
export async function fetchUnassignedBookings(hotelId) {
  const q = query(
    collection(db, "bookings"),
    where("hotelId", "==", hotelId),
    where("status", "==", "CONFIRMED"),
    where("roomId", "==", null)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Load available CLEAN rooms for a roomType
export async function fetchAvailableRooms(hotelId, roomTypeId) {
  const q = query(
    collection(db, "rooms"),
    where("hotelId", "==", hotelId),
    where("roomTypeId", "==", roomTypeId),
    where("status", "==", "CLEAN")
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Assign room to booking
export async function allocateRoom({
  bookingId,
  roomId,
  actorUid,
  hotelId,
}) {
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

// Check-in
export async function checkInBooking({ bookingId, roomId, actorUid, hotelId }) {
  await updateDoc(doc(db, "bookings", bookingId), {
    status: "CHECKED_IN",
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });

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
}

// Check-out
export async function checkOutBooking({ bookingId, roomId, actorUid, hotelId, guestUserId }) {
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
    type: "HOUSEKEEPING",
    assignedRole: "housekeeping",
    status: "NEW",
    message: "Auto-generated after check-out",
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
}

/* =========================
   HOUSEKEEPING
========================= */

export async function fetchRoomsByStatus(hotelId, statuses) {
  const q = query(
    collection(db, "rooms"),
    where("hotelId", "==", hotelId),
    where("status", "in", statuses)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateRoomStatus({ roomId, newStatus, actorUid, hotelId }) {
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
