import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchRoomsByStatus, updateRoomStatus } from "../services/staffService";

export default function HousekeepingDashboard() {
  const { currentUser, userProfile } = useAuth();
  const hotelId = userProfile?.hotelId;

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    if (!hotelId) return;

    fetchRoomsByStatus(hotelId, ["DIRTY", "MAINTENANCE"]).then(setRooms);
  }, [hotelId]);

  return (
    <div className="pt-24 pb-16 container-x">
      <h1 className="font-heading text-3xl">Housekeeping</h1>

      {rooms.map(r => (
        <div key={r.id} className="card-luxe p-5 mt-6">
          <p>Room {r.roomNumber}</p>
          <p>Status: {r.status}</p>

          {r.status !== "CLEAN" && (
            <button
              className="gold-solid-btn mt-3"
              onClick={() =>
                updateRoomStatus({
                  roomId: r.id,
                  newStatus: "CLEAN",
                  actorUid: currentUser.uid,
                  hotelId,
                })
              }
            >
              Mark Clean
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
