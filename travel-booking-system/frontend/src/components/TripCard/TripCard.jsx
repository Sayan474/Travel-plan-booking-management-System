import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

import styles from "./TripCard.module.css";

export default function TripCard({ trip, onDelete }) {
  return (
    <article className={`${styles.card} card`}>
      <img src={trip.image} alt={trip.destination} />
      <div className={styles.body}>
        <h3>{trip.title}</h3>
        <p>
          <FaMapMarkerAlt /> {trip.destination}
        </p>
        <p>
          <FaCalendarAlt /> {trip.start_date} to {trip.end_date}
        </p>
        <span className={`${styles.badge} ${styles[trip.status] || ""}`}>{trip.status}</span>
      </div>
      <div className={styles.actions}>
        <button className="btn" onClick={() => onDelete?.(trip.id)}>
          Remove
        </button>
      </div>
    </article>
  );
}
