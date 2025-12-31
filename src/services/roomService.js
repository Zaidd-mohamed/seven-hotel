// Inventory is locked down in rules for now, but we create the service for Phase 4/5.
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function fetchRoomsByRoomType(roomTypeId) {
  const q = query(collection(db, "rooms"), where("roomTypeId", "==", roomTypeId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
