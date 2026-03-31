import { useEffect, useMemo, useRef, useState } from "react";
import { FaBars, FaBell, FaTimes, FaUserCircle } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { resolveAvatarUrl } from "../../utils/avatar";
import styles from "./Navbar.module.css";

const links = [
  { to: "/", label: "Home" },
  { to: "/flights", label: "Flights" },
  { to: "/hotels", label: "Hotels" },
  { to: "/my-trips", label: "My Trips" },
  { to: "/ai-planner", label: "AI Planner" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const notifications = useMemo(
    () => [
      { id: 1, title: "Trip reminder", body: "Your next journey starts in 2 days.", time: "Now" },
      { id: 2, title: "AI plan ready", body: "Open AI Planner to review your latest itinerary.", time: "5m" },
      { id: 3, title: "Booking tip", body: "Flight prices are lower this evening.", time: "1h" },
    ],
    []
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDocClick = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.logo} onClick={() => navigate("/")}>
        <span>✈</span> TravelMind
      </div>

      <nav className={styles.links}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.right}>
        <div className={styles.notifWrap} ref={notifRef}>
          <button
            className={styles.iconBtn}
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setDropdownOpen(false);
            }}
            aria-label="Notifications"
          >
            <FaBell />
            {user && notifications.length > 0 && <span className={styles.badge}>{notifications.length}</span>}
          </button>
          {notifOpen && (
            <div className={styles.notifPanel}>
              <h4>Notifications</h4>
              {user ? (
                <div className={styles.notifList}>
                  {notifications.map((item) => (
                    <button key={item.id} className={styles.notifItem} onClick={() => navigate("/my-trips")}>
                      <strong>{item.title}</strong>
                      <span>{item.body}</span>
                      <small>{item.time}</small>
                    </button>
                  ))}
                </div>
              ) : (
                <p className={styles.notifEmpty}>Sign in to view notifications.</p>
              )}
            </div>
          )}
        </div>
        <div className={styles.userMenu} ref={profileRef}>
          <button
            className={`${styles.iconBtn} ${styles.avatarBtn}`}
            onClick={() => {
              if (user) {
                navigate("/profile");
                setDropdownOpen(false);
                setNotifOpen(false);
                return;
              }
              setDropdownOpen((prev) => !prev);
            }}
            aria-label="User profile"
          >
            {user?.avatar_url ? (
              <img src={resolveAvatarUrl(user.avatar_url)} alt={`${user.name || "User"} avatar`} className={styles.avatarImg} />
            ) : (
              <FaUserCircle />
            )}
          </button>
          {dropdownOpen && (
            <div className={styles.dropdown}>
              {user ? (
                <>
                  <button onClick={() => navigate("/profile")}>Profile</button>
                  <button onClick={() => navigate("/profile")}>Settings</button>
                  <button onClick={logout}>Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate("/login")}>Login</button>
                  <button onClick={() => navigate("/register")}>Register</button>
                </>
              )}
            </div>
          )}
        </div>
        <button className={styles.mobileBtn} onClick={() => setMenuOpen(true)}>
          <FaBars />
        </button>
      </div>

      <aside className={`${styles.drawer} ${menuOpen ? styles.open : ""}`}>
        <button className={styles.closeBtn} onClick={() => setMenuOpen(false)}>
          <FaTimes />
        </button>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
            {link.label}
          </NavLink>
        ))}
      </aside>
    </header>
  );
}
