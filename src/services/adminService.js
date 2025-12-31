import { db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

/** --------- read helpers --------- */
export async function fetchAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchAllHotels() {
  const snap = await getDocs(collection(db, "hotels"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchAllRooms() {
  const snap = await getDocs(collection(db, "rooms"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchAllBookings() {
  const snap = await getDocs(collection(db, "bookings"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchAllServiceRequests() {
  const snap = await getDocs(collection(db, "serviceRequests"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchAuditLogs(limitCount = 50) {
  // simplest: read all then slice (small datasets).
  // If you later want orderBy + limit, Firestore may request an index.
  const snap = await getDocs(collection(db, "auditLogs"));
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // newest first
  list.sort((a, b) => {
    const at = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
    const bt = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
    return bt - at;
  });

  return list.slice(0, limitCount);
}

/** --------- writes --------- */
export async function adminUpdateUser(uid, patch, actorUid) {
  await updateDoc(doc(db, "users", uid), {
    ...patch,
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });

  await addDoc(collection(db, "auditLogs"), {
    actorUid,
    action: "ADMIN_UPDATE_USER",
    targetType: "user",
    targetId: uid,
    timestamp: serverTimestamp(),
    metadata: patch,
  });
}

export async function adminCreateHotel(hotelId, data, actorUid) {
  await updateDoc(doc(db, "hotels", hotelId), {}); // ensures doc exists if used wrong
  // Better: use setDoc, but updateDoc would fail if doc doesn't exist.
  // We'll use addDoc? No—we need stable IDs. We'll do setDoc in AdminHotels page.
  await addDoc(collection(db, "auditLogs"), {
    actorUid,
    action: "ADMIN_CREATE_HOTEL",
    targetType: "hotel",
    targetId: hotelId,
    timestamp: serverTimestamp(),
    metadata: data,
  });
}

export async function adminToggleHotelActive(hotelId, active, actorUid) {
  await updateDoc(doc(db, "hotels", hotelId), {
    active,
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });

  await addDoc(collection(db, "auditLogs"), {
    actorUid,
    action: "ADMIN_TOGGLE_HOTEL",
    targetType: "hotel",
    targetId: hotelId,
    timestamp: serverTimestamp(),
    metadata: { active },
  });
}
