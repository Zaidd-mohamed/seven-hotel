/**
 * Firestore seed script (Admin SDK)
 * Run with: node scripts/seedPhase7.js
 *
 * IMPORTANT:
 * - serviceAccountKey.json must be in the SAME folder as this script: scripts/serviceAccountKey.json
 * - This script uses firebase-admin (server/admin), not client Firestore SDK.
 */

import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// ✅ Path is relative to THIS script file (scripts/)
const serviceAccount = require("./serviceAccountKey.json");

// ---- Init Admin SDK (only initialize once) ----
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function seedPhase7() {
  console.log("🌱 Seeding Phase 7 data (Admin SDK)...");

  // --------------------------------------------
  // Example Phase 7 data (replace/extend as needed)
  // --------------------------------------------

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

  // --------------------------------------------
  // Write helpers
  // --------------------------------------------
  const now = admin.firestore.FieldValue.serverTimestamp();

  // If you want to fully overwrite docs every time, set MERGE to false.
  // If you want to update/merge without deleting unknown fields, set MERGE to true.
  const MERGE = true;

  // Use a batch for fewer network calls (max 500 ops per batch)
  const batch = db.batch();

  // Hotels
  for (const h of hotels) {
    const ref = db.collection("hotels").doc(h.id);
    batch.set(
      ref,
      {
        ...h,
        updatedAt: now,
        createdAt: now, // if doc exists, merge mode won't overwrite createdAt unless you want it to
      },
      { merge: MERGE }
    );
    console.log(`🏨 queued hotel: ${h.name}`);
  }

  // Room Types
  for (const rt of roomTypes) {
    const ref = db.collection("roomTypes").doc(rt.id);
    batch.set(
      ref,
      {
        ...rt,
        updatedAt: now,
        createdAt: now,
      },
      { merge: MERGE }
    );
    console.log(`🛏️ queued room type: ${rt.name}`);
  }

  // Commit batch
  await batch.commit();

  console.log("✅ Phase 7 seeding complete!");
}

// Run
seedPhase7()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
