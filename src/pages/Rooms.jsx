import SectionTitle from "../components/SectionTitle";
import RoomCard from "../components/RoomCard";

export default function Rooms() {
  const rooms = [
    {
      id: "ocean-suite",
      name: "Ocean Suite",
      price: 220,
      summary: "Wide ocean views, calm textures, and a private balcony.",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
    },
    {
      id: "garden-villa",
      name: "Garden Villa",
      price: 310,
      summary: "A secluded villa with minimal interiors and soft lighting.",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    },
    {
      id: "hill-country-retreat",
      name: "Hill Country Retreat",
      price: 280,
      summary: "Fresh air, warm wood finishes, and quiet mornings.",
      image:
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80",
    },
    {
      id: "city-signature",
      name: "City Signature",
      price: 190,
      summary: "Modern luxury in the heart of Colombo — minimal and refined.",
      image:
        "https://images.unsplash.com/photo-1551887373-6a0a1f8d59cc?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  return (
    <div className="pt-24 pb-16 sm:pb-20">
      <div className="container-x">
        <SectionTitle
          eyebrow="Seven"
          title="Rooms & Suites"
          subtitle="Explore our signature rooms — designed for calm, comfort, and effortless elegance."
        />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((r) => (
            <RoomCard key={r.id} room={r} />
          ))}
        </div>
      </div>
    </div>
  );
}
