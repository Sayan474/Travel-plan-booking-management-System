import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { resolveAvatarUrl } from "../utils/avatar";
import styles from "./Profile.module.css";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", avatar_url: "" });
  const [security, setSecurity] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [preferences, setPreferences] = useState({ currency: "USD", language: "English", seat: "Window" });
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });

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
      setMessage({ type: "error", text: "Name and email are required" });
      return;
    }

    const changingPassword = security.current_password || security.new_password || security.confirm_password;
    if (changingPassword) {
      if (!security.current_password || !security.new_password) {
        setMessage({ type: "error", text: "Provide current password and new password" });
        return;
      }
      if (security.new_password.length < 8) {
        setMessage({ type: "error", text: "New password must be at least 8 characters" });
        return;
      }
      if (security.new_password !== security.confirm_password) {
        setMessage({ type: "error", text: "New password and confirm password do not match" });
        return;
      }
    }

    try {
      const payload = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
      };
      if (changingPassword) {
        payload.current_password = security.current_password;
        payload.new_password = security.new_password;
      }

      await api.put("/api/auth/me", payload);
      await refreshUser();
      setSecurity({ current_password: "", new_password: "", confirm_password: "" });
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Failed to update profile" });
    }
  };

  const selectAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) {
      setMessage({ type: "error", text: "Select an image file first" });
      return;
    }

    const formData = new FormData();
    formData.append("file", avatarFile);

    try {
      setUploadingAvatar(true);
      const { data } = await api.post("/api/auth/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, avatar_url: data.avatar_url || "" }));
      setAvatarFile(null);
      setAvatarPreview("");
      await refreshUser();
      setMessage({ type: "success", text: "Profile picture updated" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Failed to upload profile picture" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <main className="page">
      <h1 className="section-title">Profile</h1>
      {message.text && <p className={`${styles.message} ${message.type === "error" ? styles.error : ""}`}>{message.text}</p>}
      <div className={styles.layout}>
        <form className={`${styles.form} card`} onSubmit={save}>
          <h3>Personal Info</h3>
          <div className={styles.avatarRow}>
            <img
              src={avatarPreview || resolveAvatarUrl(profile.avatar_url) || "https://i.pravatar.cc/160"}
              alt="Profile avatar"
              className={styles.avatarPreview}
            />
            <p>Click your profile picture in the top-right nav to open this editor anytime.</p>
          </div>
          <div className={styles.uploadRow}>
            <input className="input" type="file" accept="image/*" onChange={selectAvatar} />
            <button className="btn" type="button" onClick={uploadAvatar} disabled={uploadingAvatar}>
              {uploadingAvatar ? "Uploading..." : "Upload New Photo"}
            </button>
          </div>
          <input className="input" placeholder="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <input className="input" placeholder="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <input className="input" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />

          <h3>Password</h3>
          <input
            className="input"
            placeholder="Current Password"
            type="password"
            value={security.current_password}
            onChange={(e) => setSecurity({ ...security, current_password: e.target.value })}
          />
          <input
            className="input"
            placeholder="New Password"
            type="password"
            value={security.new_password}
            onChange={(e) => setSecurity({ ...security, new_password: e.target.value })}
          />
          <input
            className="input"
            placeholder="Confirm New Password"
            type="password"
            value={security.confirm_password}
            onChange={(e) => setSecurity({ ...security, confirm_password: e.target.value })}
          />

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
