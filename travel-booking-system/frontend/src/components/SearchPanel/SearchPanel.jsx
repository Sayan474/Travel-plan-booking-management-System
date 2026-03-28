import { useState } from "react";

import styles from "./SearchPanel.module.css";

const tabs = ["Flights", "Hotels", "Packages"];

export default function SearchPanel({ onSearch }) {
  const [activeTab, setActiveTab] = useState("Flights");
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    dateFrom: "",
    dateTo: "",
    passengers: 1,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.destination) return;
    onSearch?.({ type: activeTab.toLowerCase(), ...form });
  };

  return (
    <section className={`${styles.panel} card`}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${tab === activeTab ? styles.active : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="Origin"
          value={form.origin}
          onChange={(e) => setForm({ ...form, origin: e.target.value })}
        />
        <input
          className="input"
          placeholder="Destination"
          value={form.destination}
          onChange={(e) => setForm({ ...form, destination: e.target.value })}
          required
        />
        <input
          className="input"
          type="date"
          value={form.dateFrom}
          onChange={(e) => setForm({ ...form, dateFrom: e.target.value })}
        />
        <input
          className="input"
          type="date"
          value={form.dateTo}
          onChange={(e) => setForm({ ...form, dateTo: e.target.value })}
        />
        <input
          className="input"
          type="number"
          min="1"
          value={form.passengers}
          onChange={(e) => setForm({ ...form, passengers: Number(e.target.value) })}
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>
    </section>
  );
}
