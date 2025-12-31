import { db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export async function fetchBlocksOverlapping({ hotelId, checkIn, checkOut }) {
  const q = query(
    collection(db, "bookingBlocks"),
    where("hotelId", "==", hotelId),
    where("status", "==", "CONFIRMED")
  );

  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // overlap rule:
  return items.filter((b) => {
    const existingCheckIn = b.checkIn?.toDate ? b.checkIn.toDate() : new Date(b.checkIn);
    const existingCheckOut = b.checkOut?.toDate ? b.checkOut.toDate() : new Date(b.checkOut);
    return checkIn < existingCheckOut && checkOut > existingCheckIn;
  });
}


export async function createBooking({
  userId,
  hotelId,
  roomTypeId,
  checkIn,
  checkOut,
  totalPrice,
}) {
  // 1) private booking (owner-only)
  const bookingRef = await addDoc(collection(db, "bookings"), {
    userId,
    hotelId,
    roomTypeId,
    roomId: null,
    checkIn,
    checkOut,
    status: "CONFIRMED",
    totalPrice,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId,
  });

  // 2) public availability block (NO PII)
  await addDoc(collection(db, "bookingBlocks"), {
    bookingId: bookingRef.id,
    hotelId,
    roomTypeId,
    checkIn,
    checkOut,
    status: "CONFIRMED",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return bookingRef.id;
}


export async function fetchMyBookings(userId) {
  const q = query(collection(db, "bookings"), where("userId", "==", userId));
  const snap = await getDocs(q);

  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Sort newest first in JS (createdAt is a Firestore Timestamp)
  items.sort((a, b) => {
    const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return bTime - aTime;
  });

  return items;
}

export async function cancelBooking({ bookingId, userId }) {
  // update private booking
  await updateDoc(doc(db, "bookings", bookingId), {
    status: "CANCELLED",
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });

  // update public blocks linked to bookingId
  const q = query(collection(db, "bookingBlocks"), where("bookingId", "==", bookingId));
  const snap = await getDocs(q);

  for (const d of snap.docs) {
    await updateDoc(doc(db, "bookingBlocks", d.id), {
      status: "CANCELLED",
      updatedAt: serverTimestamp(),
    });
  }
}


export async function modifyBookingDates({ bookingId, userId, checkIn, checkOut, totalPrice }) {
  await updateDoc(doc(db, "bookings", bookingId), {
    checkIn,
    checkOut,
    totalPrice,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });

  const q = query(collection(db, "bookingBlocks"), where("bookingId", "==", bookingId));
  const snap = await getDocs(q);

  for (const d of snap.docs) {
    await updateDoc(doc(db, "bookingBlocks", d.id), {
      checkIn,
      checkOut,
      updatedAt: serverTimestamp(),
    });
  }
}

