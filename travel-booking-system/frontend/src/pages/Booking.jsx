import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

import BookingForm from "../components/BookingForm/BookingForm";
import { useBooking } from "../context/BookingContext";
import api from "../services/api";
import styles from "./Booking.module.css";

export default function Booking() {
  const { selection } = useBooking();
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const confirmBooking = async (payload) => {
    setLoading(true);
    setError("");
    try {
      const tripPayload = {
        title: selection?.airline ? `Flight with ${selection.airline}` : `Stay at ${selection?.hotel_name || "Hotel"}`,
        destination: selection?.destination || selection?.location || "Destination",
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        budget: selection?.price || selection?.price_per_night || 150,
        status: "planned",
        notes: JSON.stringify(payload.add_ons),
      };
      const { data: trip } = await api.post("/api/trips", tripPayload);

      const { data: confirmation } = await api.post("/api/bookings/confirm", {
        trip_id: trip.id,
        passengers: [payload.passenger],
      });

      await api.post("/api/payments/process", {
        trip_id: trip.id,
        amount: payload.payment.amount,
        currency: "INR",
        method: "card",
      });

      setConfirmed(confirmation);
    } catch (err) {
      setError(err.response?.data?.detail || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <main className="page">
        <section className={`${styles.confirmation} card`}>
          <FaCheckCircle />
          <h2>Booking Confirmed</h2>
          <p>Reference: {confirmed.booking_reference}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <h1 className="section-title">Booking</h1>
      {error && <p className={styles.error}>{error}</p>}
      {loading && <p>Processing booking...</p>}
      <BookingForm selection={selection} onConfirm={confirmBooking} />
    </main>
  );
}
