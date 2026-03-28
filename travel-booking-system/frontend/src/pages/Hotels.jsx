import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useBooking } from "../context/BookingContext";
import styles from "./Hotels.module.css";

const sampleHotels = [
  { id: 1, hotel_name: "Azure Bay Resort", stars: 5, location: "Bali Center", amenities: ["Pool", "Spa", "WiFi"], price_per_night: 120 },
  { id: 2, hotel_name: "Urban Nest", stars: 4, location: "Downtown", amenities: ["Gym", "Breakfast"], price_per_night: 85 },
  { id: 3, hotel_name: "Sunset Stay", stars: 3, location: "Beach Road", amenities: ["WiFi", "Parking"], price_per_night: 65 },
];

export default function Hotels() {
  const navigate = useNavigate();
  const { searchData, setSelection } = useBooking();
  const [filters, setFilters] = useState({ maxPrice: 200, stars: "all", amenity: "all" });

  const hotels = useMemo(() => {
    let list = [...sampleHotels].filter((h) => h.price_per_night <= filters.maxPrice);
    if (filters.stars !== "all") list = list.filter((h) => h.stars === Number(filters.stars));
    if (filters.amenity !== "all") list = list.filter((h) => h.amenities.includes(filters.amenity));
    return list;
  }, [filters]);

  return (
    <main className="page">
      <h1 className="section-title">Hotels</h1>
      <div className={styles.searchTop}>
        <input className="input" defaultValue={searchData.destination || ""} placeholder="Destination" />
        <input className="input" type="date" defaultValue={searchData.dateFrom || ""} />
        <input className="input" type="date" defaultValue={searchData.dateTo || ""} />
        <input className="input" type="number" placeholder="Guests" defaultValue={searchData.passengers || 1} />
      </div>

      <div className={styles.layout}>
        <aside className={`${styles.filters} card`}>
          <h3>Filters</h3>
          <label>Max Price ${filters.maxPrice}</label>
          <input type="range" min="40" max="300" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })} />
          <label>Stars</label>
          <select className="select" value={filters.stars} onChange={(e) => setFilters({ ...filters, stars: e.target.value })}>
            <option value="all">All</option>
            <option value="5">5 Star</option>
            <option value="4">4 Star</option>
            <option value="3">3 Star</option>
          </select>
          <label>Amenities</label>
          <select className="select" value={filters.amenity} onChange={(e) => setFilters({ ...filters, amenity: e.target.value })}>
            <option value="all">All</option>
            <option value="Pool">Pool</option>
            <option value="Spa">Spa</option>
            <option value="WiFi">WiFi</option>
          </select>
        </aside>

        <section>
          <button className="btn">Map Toggle</button>
          <div className={styles.results}>
            {hotels.map((h) => (
              <article className={`${styles.hotelCard} card`} key={h.id}>
                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=900" alt={h.hotel_name} />
                <div>
                  <h4>{h.hotel_name}</h4>
                  <p>{"★".repeat(h.stars)} • {h.location}</p>
                  <div className={styles.chips}>
                    {h.amenities.map((a) => (
                      <span key={a}>{a}</span>
                    ))}
                  </div>
                </div>
                <strong>${h.price_per_night}/night</strong>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelection(h);
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
