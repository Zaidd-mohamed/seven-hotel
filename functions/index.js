const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * createBooking
 * Secure server-side booking with no double booking
 */
exports.createBooking = functions.https.onCall(async (data, context) => {
  // 1️⃣ Auth validation
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to book."
    );
  }

  const userId = context.auth.uid;
  const { hotelId, roomTypeId, checkIn, checkOut } = data;

  if (!hotelId || !roomTypeId || !checkIn || !checkOut) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing booking data."
    );
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkOutDate <= checkInDate) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid date range."
    );
  }

  // 2️⃣ Fetch rooms (inventory)
  const roomsSnap = await db
    .collection("rooms")
    .where("hotelId", "==", hotelId)
    .where("roomTypeId", "==", roomTypeId)
    .get();

  if (roomsSnap.empty) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "No rooms configured for this room type."
    );
  }

  const rooms = roomsSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  // 3️⃣ Fetch active bookings for those rooms
  const bookingsSnap = await db
    .collection("bookings")
    .where("hotelId", "==", hotelId)
    .where("roomTypeId", "==", roomTypeId)
    .where("status", "in", ["CONFIRMED", "CHECKED_IN"])
    .get();

  const bookings = bookingsSnap.docs.map((d) => d.data());

  // 4️⃣ Find a free room
  let assignedRoom = null;

  for (const room of rooms) {
    const overlapping = bookings.some((b) => {
      if (b.roomId !== room.id) return false;

      const existingIn = b.checkIn.toDate();
      const existingOut = b.checkOut.toDate();

      return (
        checkInDate < existingOut &&
        checkOutDate > existingIn
      );
    });

    if (!overlapping) {
      assignedRoom = room;
      break;
    }
  }

  if (!assignedRoom) {
    throw new functions.https.HttpsError(
      "resource-exhausted",
      "No rooms available for selected dates."
    );
  }

  // 5️⃣ Calculate price
  const roomTypeDoc = await db.collection("roomTypes").doc(roomTypeId).get();
  const pricePerNight = roomTypeDoc.data().pricePerNight;
  const nights =
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
  const totalPrice = Math.round(nights * pricePerNight);

  // 6️⃣ Create booking (atomic)
  const bookingRef = db.collection("bookings").doc();

  await bookingRef.set({
    userId,
    hotelId,
    roomTypeId,
    roomId: assignedRoom.id,
    checkIn: admin.firestore.Timestamp.fromDate(checkInDate),
    checkOut: admin.firestore.Timestamp.fromDate(checkOutDate),
    status: "CONFIRMED",
    totalPrice,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: userId,
    updatedBy: userId,
  });

  // 7️⃣ Audit log
  await db.collection("auditLogs").add({
    actorUid: userId,
    action: "CREATE_BOOKING",
    targetType: "booking",
    targetId: bookingRef.id,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 8️⃣ Notification
  await db.collection("notifications").add({
    userId,
    hotelId,
    title: "Booking Confirmed",
    message: "Your booking has been successfully confirmed.",
    type: "BOOKING_CONFIRMATION",
    status: "SENT",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 9️⃣ Return success
  return {
    success: true,
    bookingId: bookingRef.id,
    roomNumber: assignedRoom.roomNumber,
  };
});
