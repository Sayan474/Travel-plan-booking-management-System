import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useBooking } from "../context/BookingContext";
import styles from "./Flights.module.css";

const sampleFlights = [
  { id: 1, airline: "SkyWays", departure: "07:40", arrival: "12:05", duration: "4h 25m", stops: 0, price: 8320, badge: "Best Value" },
  { id: 2, airline: "AeroLink", departure: "10:25", arrival: "14:30", duration: "4h 05m", stops: 1, price: 9680, badge: "Fastest" },
  { id: 3, airline: "JetCloud", departure: "16:10", arrival: "21:00", duration: "4h 50m", stops: 1, price: 7490, badge: "Best Value" },
];

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function Flights() {
  const navigate = useNavigate();
  const { searchData, setSelection } = useBooking();
  const [filters, setFilters] = useState({ maxPrice: 15000, stops: "all", airline: "all", dep: "any" });
  const [sortBy, setSortBy] = useState("price");

  const flights = useMemo(() => {
    let list = [...sampleFlights].filter((f) => f.price <= filters.maxPrice);
    if (filters.stops !== "all") list = list.filter((f) => String(f.stops) === filters.stops);
    if (filters.airline !== "all") list = list.filter((f) => f.airline === filters.airline);
    if (sortBy === "price") list.sort((a, b) => a.price - b.price);
    if (sortBy === "duration") list.sort((a, b) => a.duration.localeCompare(b.duration));
    if (sortBy === "departure") list.sort((a, b) => a.departure.localeCompare(b.departure));
    return list;
  }, [filters, sortBy]);

  return (
    <main className="page">
      <h1 className="section-title">Flights</h1>
      <div className={styles.searchTop}>
        <input className="input" defaultValue={searchData.origin || ""} placeholder="Origin" />
        <input className="input" defaultValue={searchData.destination || ""} placeholder="Destination" />
        <input className="input" type="date" defaultValue={searchData.dateFrom || ""} />
      </div>

      <div className={styles.layout}>
        <aside className={`${styles.filters} card`}>
          <h3>Filters</h3>
          <label>Max Price {formatINR(filters.maxPrice)}</label>
          <input type="range" min="5000" max="15000" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })} />
          <label>Stops</label>
          <select className="select" value={filters.stops} onChange={(e) => setFilters({ ...filters, stops: e.target.value })}>
            <option value="all">All</option>
            <option value="0">Non-stop</option>
            <option value="1">1 Stop</option>
          </select>
          <label>Airline</label>
          <select className="select" value={filters.airline} onChange={(e) => setFilters({ ...filters, airline: e.target.value })}>
            <option value="all">All</option>
            <option value="SkyWays">SkyWays</option>
            <option value="AeroLink">AeroLink</option>
            <option value="JetCloud">JetCloud</option>
          </select>
        </aside>

        <section>
          <div className={styles.sortRow}>
            <span>{flights.length} flights found</span>
            <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="price">Sort by Price</option>
              <option value="duration">Sort by Duration</option>
              <option value="departure">Sort by Departure</option>
            </select>
          </div>
          <div className={styles.results}>
            {flights.map((f) => (
              <article className={`${styles.flightCard} card`} key={f.id}>
                <div>
                  <h4>{f.airline}</h4>
                  <p>{f.departure} → {f.arrival}</p>
                  <p>{f.duration} • {f.stops} stop(s)</p>
                </div>
                <span className={styles.badge}>{f.badge}</span>
                <strong>{formatINR(f.price)}</strong>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelection(f);
                    navigate("/booking");
                  }}
                >
                  Book
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
