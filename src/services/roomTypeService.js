import { db } from "../firebase/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

export async function fetchRoomTypesByHotel(hotelId) {
  const q = query(
    collection(db, "roomTypes"),
    where("hotelId", "==", hotelId),
    where("active", "==", true)
  );

  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // sort locally to avoid Firestore composite index
  items.sort((a, b) => Number(a.pricePerNight || 0) - Number(b.pricePerNight || 0));
  return items;
}

export async function fetchRoomTypeById(roomTypeId) {
  const snap = await getDoc(doc(db, "roomTypes", roomTypeId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
