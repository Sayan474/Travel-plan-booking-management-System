import styles from "./Dashboard.module.css";

export default function Dashboard({ stats }) {
  return (
    <section className={styles.grid}>
      {stats.map((item) => (
        <div key={item.label} className={`${styles.card} card`}>
          <h4>{item.label}</h4>
          <p>{item.value}</p>
        </div>
      ))}
    </section>
  );
}
