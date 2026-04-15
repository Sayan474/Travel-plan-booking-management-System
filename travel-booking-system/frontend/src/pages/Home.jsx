import { useEffect, useState } from "react";
import { FaRoute, FaSearchLocation, FaSuitcaseRolling } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Footer from "../components/Footer/Footer";
import Hero from "../components/Hero/Hero";
import SearchPanel from "../components/SearchPanel/SearchPanel";
import { useBooking } from "../context/BookingContext";
import styles from "./Home.module.css";

const featured = [
  { city: "Goa", price: "₹12,500", img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800" },
  { city: "Jaipur", price: "₹9,200", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800" },
  { city: "Varanasi", price: "₹7,400", img: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800" },
  { city: "Dubai", price: "₹35,700", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800" },
  { city: "Manali", price: "₹10,800", img: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=800" },
  { city: "Munnar", price: "₹8,600", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800" },
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
