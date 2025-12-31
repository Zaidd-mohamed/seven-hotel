import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchUnassignedBookings,
  fetchAvailableRooms,
  allocateRoom,
  checkInBooking,
  checkOutBooking,
} from "../services/staffService";

export default function ReceptionDashboard() {
  const { currentUser, userProfile } = useAuth();
  const hotelId = userProfile?.hotelId;

  const [bookings, setBookings] = useState([]);
  const [roomsByBooking, setRoomsByBooking] = useState({});

  useEffect(() => {
    if (!hotelId) return;

    fetchUnassignedBookings(hotelId).then(setBookings);
  }, [hotelId]);

  async function loadRooms(booking) {
    const rooms = await fetchAvailableRooms(hotelId, booking.roomTypeId);
    setRoomsByBooking(prev => ({ ...prev, [booking.id]: rooms }));
  }

  return (
    <div className="pt-24 pb-16 container-x">
      <h1 className="font-heading text-3xl">Reception Desk</h1>

      {bookings.map(b => (
        <div key={b.id} className="card-luxe p-5 mt-6">
          <p className="text-sm text-white/70">Booking: {b.id}</p>

          <button
            className="gold-outline-btn mt-3"
            onClick={() => loadRooms(b)}
          >
            Load Available Rooms
          </button>

          {roomsByBooking[b.id]?.map(r => (
            <button
              key={r.id}
              className="gold-solid-btn mt-2 mr-2"
              onClick={() =>
                allocateRoom({
                  bookingId: b.id,
                  roomId: r.id,
                  actorUid: currentUser.uid,
                  hotelId,
                })
              }
            >
              Assign Room {r.roomNumber}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
