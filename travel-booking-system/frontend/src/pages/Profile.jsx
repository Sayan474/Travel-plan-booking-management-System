import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import styles from "./Profile.module.css";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", avatar_url: "" });
  const [preferences, setPreferences] = useState({ currency: "USD", language: "English", seat: "Window" });
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await api.get("/api/bookings/history");
        setHistory(data);
      } catch (_) {}
    };
    loadHistory();
  }, []);

  const save = async (event) => {
    event.preventDefault();
    if (!profile.name || !profile.email) {
      setMessage("Name and email are required");
      return;
    }
    try {
      await api.put("/api/auth/me", {
        name: profile.name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
      });
      await refreshUser();
      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to update profile");
    }
  };

  return (
    <main className="page">
      <h1 className="section-title">Profile</h1>
      {message && <p className={styles.message}>{message}</p>}
      <div className={styles.layout}>
        <form className={`${styles.form} card`} onSubmit={save}>
          <h3>Personal Info</h3>
          <input className="input" placeholder="Avatar URL" value={profile.avatar_url} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} />
          <input className="input" placeholder="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <input className="input" placeholder="Email" value={profile.email} disabled />
          <input className="input" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />

          <h3>Password</h3>
          <input className="input" placeholder="Current Password" type="password" />
          <input className="input" placeholder="New Password" type="password" />

          <h3>Preferences</h3>
          <select className="select" value={preferences.currency} onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}>
            <option>USD</option>
            <option>EUR</option>
            <option>INR</option>
          </select>
          <select className="select" value={preferences.language} onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}>
            <option>English</option>
            <option>French</option>
            <option>Japanese</option>
          </select>
          <select className="select" value={preferences.seat} onChange={(e) => setPreferences({ ...preferences, seat: e.target.value })}>
            <option>Window</option>
            <option>Aisle</option>
          </select>

          <button className="btn btn-primary" type="submit">Save Changes</button>
        </form>

        <section className={`${styles.history} card`}>
          <h3>Booking History</h3>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Budget</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.destination}</td>
                  <td>{item.status}</td>
                  <td>${Number(item.budget || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
