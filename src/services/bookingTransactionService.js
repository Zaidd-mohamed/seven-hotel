import { db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
  doc,
} from "firebase/firestore";

// overlap rule: newIn < existingOut AND newOut > existingIn
function overlaps(newIn, newOut, existingIn, existingOut) {
  return newIn < existingOut && newOut > existingIn;
}

export async function createBookingEasyLock({
  userId,
  hotelId,
  roomTypeId,
  checkInDate,
  checkOutDate,
  totalPrice,
}) {
  // 1) Read existing blocks (normal query)
  const blocksQ = query(
    collection(db, "bookingBlocks"),
    where("hotelId", "==", hotelId),
    where("roomTypeId", "==", roomTypeId),
    where("status", "==", "CONFIRMED")
  );

  const snap = await getDocs(blocksQ);

  for (const d of snap.docs) {
    const b = d.data();
    const existingIn = b.checkIn?.toDate ? b.checkIn.toDate() : new Date(b.checkIn);
    const existingOut = b.checkOut?.toDate ? b.checkOut.toDate() : new Date(b.checkOut);

    if (overlaps(checkInDate, checkOutDate, existingIn, existingOut)) {
      throw new Error("No availability for selected dates.");
    }
  }

  // 2) Batch write all docs (atomic write)
  const batch = writeBatch(db);

  const bookingRef = doc(collection(db, "bookings"));
  const blockRef = doc(collection(db, "bookingBlocks"));
  const auditRef = doc(collection(db, "auditLogs"));
  const notifRef = doc(collection(db, "notifications"));

  batch.set(bookingRef, {
    userId,
    hotelId,
    roomTypeId,
    roomId: null,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    status: "CONFIRMED",
    totalPrice,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId,
  });

  batch.set(blockRef, {
    bookingId: bookingRef.id,
    hotelId,
    roomTypeId,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    status: "CONFIRMED",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(auditRef, {
    actorUid: userId,
    action: "CREATE_BOOKING",
    targetType: "booking",
    targetId: bookingRef.id,
    timestamp: serverTimestamp(),
    metadata: { hotelId, roomTypeId },
  });

  batch.set(notifRef, {
    userId,
    hotelId,
    title: "Booking Confirmed",
    message: "Your booking has been successfully confirmed.",
    type: "BOOKING_CONFIRMATION",
    status: "UNREAD",
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  return { bookingId: bookingRef.id };
}
