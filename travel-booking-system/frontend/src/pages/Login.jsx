import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import styles from "./Auth.module.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    try {
      await login(form);
      navigate("/my-trips");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <main className={styles.wrap}>
      <form className={`${styles.card} card`} onSubmit={submit}>
        <h1>Login</h1>
        {error && <p className={styles.error}>{error}</p>}
        <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn-primary" type="submit">Login</button>
        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
