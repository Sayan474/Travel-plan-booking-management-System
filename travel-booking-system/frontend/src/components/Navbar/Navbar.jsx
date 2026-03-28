import { useEffect, useState } from "react";
import { FaBars, FaBell, FaTimes, FaUserCircle } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
        <button className={styles.iconBtn}>
          <FaBell />
        </button>
        <div className={styles.userMenu}>
          <button className={styles.iconBtn} onClick={() => setDropdownOpen(!dropdownOpen)}>
            <FaUserCircle />
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
