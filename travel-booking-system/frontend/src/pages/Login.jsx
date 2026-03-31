import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function PasswordField({ label, placeholder, visible, onToggle, value, onChange }) {
  return (
    <label>
      {label}
      <span className="password-field">
        <input
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}

function Login({ initialMode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [isSignup, setIsSignup] = useState(initialMode === "signup");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (location.pathname === "/register") {
      setIsSignup(true);
      return;
    }
    if (location.pathname === "/login") {
      setIsSignup(false);
    }
  }, [location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(loginData);
      navigate("/my-trips");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(signupData);
      navigate("/my-trips");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="ambient">
        <span className="orb orb-one" />
        <span className="orb orb-two" />
        <span className="orb orb-three" />
        <span className="route route-one" />
        <span className="route route-two" />
        <span className="plane plane-one" />
        <span className="plane plane-two" />
        <span className="pin pin-one" />
        <span className="pin pin-two" />
        <span className="ticket ticket-one" />
      </div>

      <section className="auth-zone">
        <header className="auth-header">
          <h1>Plan Journeys. Manage Bookings. Travel Smarter.</h1>
          <p className="sub">
            Access your dashboard to manage itineraries, payments, and customer trips in one place.
          </p>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <div className={`card-wrap ${isSignup ? "flipped" : ""}`}>

          {/* LOGIN CARD */}
          <div className={`card-face login-face ${isSignup ? "is-hidden" : "is-active"}`}>
            <h2>Welcome Back</h2>
            <p>Sign in to continue organizing memorable travel experiences.</p>
            <form className="auth-form" onSubmit={handleLogin}>
              <label>
                Email
                <input
                  type="email"
                  placeholder="you@travelco.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </label>
              <PasswordField
                label="Password"
                placeholder="Enter password"
                visible={showLoginPassword}
                onToggle={() => setShowLoginPassword((v) => !v)}
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <p className="switch-text">
              New here?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(true);
                  setError("");
                  navigate("/register");
                }}
              >
                Create an account
              </button>
            </p>
          </div>

          {/* SIGNUP CARD */}
          <div className={`card-face signup-face ${isSignup ? "is-active" : "is-hidden"}`}>
            <h2>Create Account</h2>
            <p>Set up your profile and start managing bookings in minutes.</p>
            <form className="auth-form" onSubmit={handleSignup}>
              <label>
                Full Name
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  placeholder="you@travelco.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                />
              </label>
              <PasswordField
                label="Password"
                placeholder="Create password"
                visible={showSignupPassword}
                onToggle={() => setShowSignupPassword((v) => !v)}
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>
            <p className="switch-text">
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setError("");
                  navigate("/login");
                }}
              >
                Back to login
              </button>
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}

export default Login;