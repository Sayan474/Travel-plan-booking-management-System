import { useEffect, useState } from "react";
import { FaRoute, FaSearchLocation, FaSuitcaseRolling } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Footer from "../components/Footer/Footer";
import Hero from "../components/Hero/Hero";
import SearchPanel from "../components/SearchPanel/SearchPanel";
import { useBooking } from "../context/BookingContext";
import styles from "./Home.module.css";

const featured = [
  { city: "Bali", price: "$480", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800" },
  { city: "Tokyo", price: "$610", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800" },
  { city: "Paris", price: "$540", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800" },
  { city: "Dubai", price: "$430", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800" },
  { city: "Rome", price: "$460", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800" },
  { city: "Santorini", price: "$520", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800" },
];

const testimonials = [
  "TravelMind built my entire Thailand plan in 30 seconds. Brilliant!",
  "The AI planner plus booking flow is ridiculously smooth.",
  "Found cheaper hotels and better flight timings than manual search.",
];

export default function Home() {
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();
  const { setSearchData } = useBooking();

  useEffect(() => {
    const timer = setInterval(() => setIdx((v) => (v + 1) % testimonials.length), 3200);
    return () => clearInterval(timer);
  }, []);

  const onSearch = (payload) => {
    setSearchData(payload);
    navigate(payload.type === "hotels" ? "/hotels" : "/flights");
  };

  return (
    <main className="page">
      <Hero />
      <SearchPanel onSearch={onSearch} />

      <section className={`${styles.stats} card`}>
        <p>10K+ Trips Planned</p>
        <p>500+ Destinations</p>
        <p>98% Satisfaction</p>
      </section>

      <section>
        <h2 className="section-title">Featured Destinations</h2>
        <div className={styles.destinations}>
          {featured.map((item) => (
            <article key={item.city} className={`${styles.destinationCard} card`}>
              <img src={item.img} alt={item.city} />
              <div>
                <h4>{item.city}</h4>
                <p>From {item.price}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">How It Works</h2>
        <div className={styles.steps}>
          <div className="card">
            <FaSearchLocation />
            <h4>Search</h4>
            <p>Enter destination, dates, and budget.</p>
          </div>
          <div className="card">
            <FaRoute />
            <h4>Plan</h4>
            <p>TravelMind builds flights, stays, and itinerary.</p>
          </div>
          <div className="card">
            <FaSuitcaseRolling />
            <h4>Book</h4>
            <p>Confirm and manage all trips in one dashboard.</p>
          </div>
        </div>
      </section>

      <section className={`${styles.aiCta} card`} onClick={() => navigate("/ai-planner")}>
        Let TravelMind AI plan your entire trip in seconds →
      </section>

      <section className={`${styles.testimonial} card`}>
        <h3>What Travelers Say</h3>
        <p>{testimonials[idx]}</p>
      </section>

      <Footer />
    </main>
  );
}
