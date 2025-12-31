import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchActiveHotels } from "../services/hotelService";

const HotelContext = createContext(null);

export function HotelProvider({ children }) {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [hotelsError, setHotelsError] = useState("");

  useEffect(() => {
    async function load() {
      setLoadingHotels(true);
      setHotelsError("");
      try {
        const list = await fetchActiveHotels();
        setHotels(list);

        // default to first hotel
        if (list.length > 0) setSelectedHotelId(list[0].id);
      } catch (e) {
        setHotelsError("Failed to load hotels.");
      } finally {
        setLoadingHotels(false);
      }
    }
    load();
  }, []);

  const value = useMemo(
    () => ({
      hotels,
      selectedHotelId,
      setSelectedHotelId,
      loadingHotels,
      hotelsError,
      selectedHotel: hotels.find((h) => h.id === selectedHotelId) || null,
    }),
    [hotels, selectedHotelId, loadingHotels, hotelsError]
  );

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
}

export function useHotel() {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error("useHotel must be used inside <HotelProvider>");
  return ctx;
}
