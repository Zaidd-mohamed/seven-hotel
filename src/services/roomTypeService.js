import { db } from "../firebase/firebase";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";

export async function fetchRoomTypesByHotel(hotelId) {
  const q = query(
    collection(db, "roomTypes"),
    where("hotelId", "==", hotelId),
    where("active", "==", true),
    orderBy("pricePerNight", "asc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchRoomTypeById(roomTypeId) {
  const snap = await getDoc(doc(db, "roomTypes", roomTypeId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
