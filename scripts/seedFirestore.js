/**
 * One-time Firestore seed script
 * Run with: node scripts/seedFirestore.js
 */

import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seed() {
  console.log("🌱 Seeding Firestore...");

  // ---------- HOTELS ----------
  const hotels = [
    {
      id: "seven-colombo",
      name: "Seven Colombo",
      location: "Colombo, Sri Lanka",
      description: "Minimal city luxury with ocean light and calm interiors.",
      heroImage:
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80",
      active: true,
    },
    {
      id: "seven-galle",
      name: "Seven Galle",
      location: "Galle, Sri Lanka",
      description: "Oceanfront calm with timeless design and soft coastal light.",
      heroImage:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80",
      active: true,
    },
    {
      id: "seven-kandy",
      name: "Seven Kandy",
      location: "Kandy, Sri Lanka",
      description: "Hill-country retreat surrounded by mist and quiet gardens.",
      heroImage:
        "https://images.unsplash.com/photo-1501117716987-c8e1ecb210ff?auto=format&fit=crop&w=2000&q=80",
      active: true,
    },
  ];

  for (const h of hotels) {
    await db.collection("hotels").doc(h.id).set({
      ...h,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`🏨 Hotel added: ${h.name}`);
  }

  // ---------- ROOM TYPES ----------
  const roomTypes = [
    {
      id: "seven-colombo-deluxe",
      hotelId: "seven-colombo",
      name: "Deluxe Room",
      description: "Soft textures, city views, and refined minimal comfort.",
      pricePerNight: 190,
      maxGuests: 2,
      amenities: ["Wi-Fi", "Rain shower", "Work desk", "In-room dining"],
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      ],
      active: true,
    },
    {
      id: "seven-colombo-suite",
      hotelId: "seven-colombo",
      name: "Signature Suite",
      description: "Spacious suite with premium finishes and ocean light.",
      pricePerNight: 280,
      maxGuests: 3,
      amenities: ["Wi-Fi", "Bathtub", "Ocean view", "Private lounge"],
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
      ],
      active: true,
    },
  ];

  for (const rt of roomTypes) {
    await db.collection("roomTypes").doc(rt.id).set({
      ...rt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`🛏️ Room type added: ${rt.name}`);
  }

  console.log("✅ Firestore seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
