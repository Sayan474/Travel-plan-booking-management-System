import { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";

import Dashboard from "../components/Dashboard/Dashboard";
import TripCard from "../components/TripCard/TripCard";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import styles from "./MyTrips.module.css";

export default function MyTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [tab, setTab] = useState("upcoming");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", destination: "", start_date: "", end_date: "", budget: "" });

  const loadTrips = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/trips");
      setTrips(
        data.map((t) => ({
          ...t,
          image:
            "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=900",
        }))
      );
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const filtered = useMemo(
    () =>
      trips.filter((trip) => {
        if (tab === "upcoming") return ["planned", "booked"].includes(trip.status);
        if (tab === "past") return trip.status === "completed";
        return trip.status === "cancelled";
      }),
    [trips, tab]
  );

  const stats = useMemo(() => {
    const total = trips.length;
    const upcoming = trips.filter((t) => ["planned", "booked"].includes(t.status)).length;
    const spent = trips.reduce((acc, t) => acc + Number(t.budget || 0), 0);
    return [
      { label: "Total Trips", value: total },
      { label: "Upcoming", value: upcoming },
      { label: "Spent This Year", value: `$${spent.toFixed(0)}` },
      { label: "Miles Flown", value: total * 1800 },
    ];
  }, [trips]);

  const createTrip = async (event) => {
    event.preventDefault();
    if (!form.title || !form.destination || !form.start_date || !form.end_date) {
      setError("Please fill all required fields");
      return;
    }
    try {
      await api.post("/api/trips", {
        ...form,
        budget: Number(form.budget || 0),
        status: "planned",
      });
      setShowModal(false);
      setForm({ title: "", destination: "", start_date: "", end_date: "", budget: "" });
      loadTrips();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create trip");
    }
  };

  const deleteTrip = async (id) => {
    await api.delete(`/api/trips/${id}`);
    loadTrips();
  };

  return (
    <main className="page">
      <header className={styles.header}>
        <div>
          <h1 className="section-title">Welcome back, {user?.name || "Traveler"}</h1>
          <p>Track, organize, and book every journey.</p>
        </div>
        <img src={user?.avatar_url || "https://i.pravatar.cc/120"} alt="avatar" className={styles.avatar} />
      </header>

      <Dashboard stats={stats} />

      {error && <p className={styles.error}>{error}</p>}
      {loading ? <p>Loading trips...</p> : null}

      <div className={styles.tabs}>
        {[
          ["upcoming", "Upcoming"],
          ["past", "Past"],
          ["cancelled", "Cancelled"],
        ].map(([value, label]) => (
          <button key={value} className={`btn ${tab === value ? "btn-primary" : ""}`} onClick={() => setTab(value)}>
            {label}
          </button>
        ))}
      </div>

      <section className={styles.grid}>
        {filtered.map((trip) => (
          <TripCard key={trip.id} trip={trip} onDelete={deleteTrip} />
        ))}
      </section>

      <button className={`${styles.fab} btn btn-primary`} onClick={() => setShowModal(true)}>
        <FaPlus /> Create New Trip
      </button>

      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <form className={`${styles.modal} card`} onClick={(e) => e.stopPropagation()} onSubmit={createTrip}>
            <h3>Create New Trip</h3>
            <input className="input" placeholder="Trip Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="input" placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            <input className="input" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <input className="input" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            <input className="input" type="number" placeholder="Budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            <button className="btn btn-primary" type="submit">Save Trip</button>
          </form>
        </div>
      )}
    </main>
  );
}
