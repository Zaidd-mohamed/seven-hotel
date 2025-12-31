import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

export default function SeedPhase7() {
  const { currentUser } = useAuth();
  const [msg, setMsg] = useState("");

  async function seed() {
  if (!currentUser) {
    setMsg("Please login first.");
    return;
  }

  setMsg("Seeding...");

  try {
    // 1) HOTEL
    await setDoc(doc(db, "hotels", "seven-colombo"), {
      name: "Seven Colombo",
      location: "Colombo, Sri Lanka",
      description: "Luxury city hotel",
      heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      active: true,
      createdAt: serverTimestamp(),
    });

    // 2) ROOM TYPES
    await setDoc(doc(db, "roomTypes", "deluxe"), {
      hotelId: "seven-colombo",
      name: "Deluxe Room",
      description: "Elegant room with city view",
      pricePerNight: 250,
      maxGuests: 2,
      amenities: ["WiFi", "AC", "TV"],
      images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32"],
      active: true,
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "roomTypes", "suite"), {
      hotelId: "seven-colombo",
      name: "Suite",
      description: "Luxury suite with lounge area",
      pricePerNight: 400,
      maxGuests: 4,
      amenities: ["WiFi", "AC", "TV", "Mini Bar"],
      images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427"],
      active: true,
      createdAt: serverTimestamp(),
    });

    // 3) ROOMS
    const rooms = [
      { id: "101", type: "deluxe" },
      { id: "102", type: "deluxe" },
      { id: "201", type: "suite" },
      { id: "202", type: "suite" },
    ];

    for (const r of rooms) {
      await setDoc(doc(db, "rooms", r.id), {
        hotelId: "seven-colombo",
        roomTypeId: r.type,
        roomNumber: r.id,
        status: "CLEAN",
        createdAt: serverTimestamp(),
      });
    }

    /**
     * 4) STAFF USER PROFILES (Firestore)
     * ✅ You MUST paste the UIDs from Firebase Auth here
     */
    const RECEPTION_UID = "10";
    const HOUSEKEEP_UID = "11";

    await setDoc(doc(db, "users", RECEPTION_UID), {
      uid: RECEPTION_UID,
      name: "Reception Staff",
      email: "reception@seven.com",
      role: "receptionist",
      hotelId: "seven-colombo",
      disabled: false,
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "users", HOUSEKEEP_UID), {
      uid: HOUSEKEEP_UID,
      name: "Housekeeping Staff",
      email: "housekeeping@seven.com",
      role: "housekeeping",
      hotelId: "seven-colombo",
      disabled: false,
      createdAt: serverTimestamp(),
    });

    setMsg("✅ Seed complete (hotel, roomTypes, rooms, staff profiles).");
  } catch (e) {
    console.error(e);
    setMsg(e?.message || "Seed failed.");
  }
}


  return (
    <div className="pt-24 pb-16">
      <div className="container-x card-luxe p-8">
        <h1 className="font-heading text-3xl">Seed Phase 7 Data</h1>
        <p className="mt-3 text-white/70">
          Temporary page. Login first, then seed.
        </p>

        <button className="gold-solid-btn mt-6" onClick={seed}>
          Seed Now
        </button>

        {msg && <p className="mt-4 text-white/70">{msg}</p>}
      </div>
    </div>
  );
}
