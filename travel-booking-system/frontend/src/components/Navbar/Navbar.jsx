import { useEffect, useMemo, useRef, useState } from "react";
import { FaBars, FaBell, FaTimes, FaUserCircle } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
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
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const formatTimeFromNow = (futureDate) => {
    const now = new Date();
    const ms = futureDate.getTime() - now.getTime();
    if (ms <= 0) return "Now";
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.round(hours / 24);
    return `${days}d`;
  };

  const formatTripDateTime = (dateValue) =>
    dateValue.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const buildNotificationsFromTrips = useMemo(
    () => (trips) => {
      const now = new Date();
      return trips
        .filter((trip) => ["planned", "booked"].includes(trip.status))
        .map((trip) => {
          const firstFlight = (trip.flights || [])
            .map((flight) => new Date(flight.departure_time))
            .filter((dateValue) => !Number.isNaN(dateValue.getTime()))
            .sort((a, b) => a.getTime() - b.getTime())[0];

          const startDate = trip.start_date
            ? new Date(`${trip.start_date}T09:00:00`)
            : null;
          const notifyAt = firstFlight || startDate;

          if (!notifyAt || notifyAt.getTime() < now.getTime()) {
            return null;
          }

          return {
            id: trip.id,
            title: notifyAt.getTime() - now.getTime() < 24 * 60 * 60 * 1000 ? "Trip today" : "Upcoming trip",
            body: `${trip.destination} starts on ${formatTripDateTime(notifyAt)}`,
            time: formatTimeFromNow(notifyAt),
            notifyAt,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.notifyAt.getTime() - b.notifyAt.getTime())
        .slice(0, 6);
    },
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

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }

      setNotifLoading(true);
      try {
        const { data } = await api.get("/api/trips");
        if (!cancelled) {
          setNotifications(buildNotificationsFromTrips(data));
        }
      } catch (error) {
        if (!cancelled) {
          setNotifications([]);
        }
      } finally {
        if (!cancelled) {
          setNotifLoading(false);
        }
      }
    };

    loadNotifications();
    const intervalId = setInterval(loadNotifications, 60000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [user, buildNotificationsFromTrips]);

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
        {user && (
          <button className={styles.logoutBtn} onClick={logout} aria-label="Log out">
            Logout
          </button>
        )}
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
              {user && notifLoading ? (
                <p className={styles.notifEmpty}>Loading notifications...</p>
              ) : user ? (
                <div className={styles.notifList}>
                  {notifications.length ? (
                    notifications.map((item) => (
                      <button key={item.id} className={styles.notifItem} onClick={() => navigate("/my-trips")}>
                        <strong>{item.title}</strong>
                        <span>{item.body}</span>
                        <small>{item.time}</small>
                      </button>
                    ))
                  ) : (
                    <p className={styles.notifEmpty}>No upcoming trip reminders.</p>
                  )}
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
