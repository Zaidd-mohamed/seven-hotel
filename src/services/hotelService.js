import { db } from "../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function fetchActiveHotels() {
  const q = query(collection(db, "hotels"), where("active", "==", true));
  const snap = await getDocs(q);

  const hotels = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  hotels.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  return hotels;
}
