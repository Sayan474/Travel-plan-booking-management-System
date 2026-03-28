import { useNavigate } from "react-router-dom";

import styles from "./Hero.module.css";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1>Your AI-Powered Travel Companion</h1>
        <p>
          Discover flights, find dreamy stays, and generate full itineraries in seconds with
          TravelMind.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/ai-planner")}>
          Plan My Trip
        </button>
      </div>
      <div className={styles.plane}>✈</div>
    </section>
  );
}
