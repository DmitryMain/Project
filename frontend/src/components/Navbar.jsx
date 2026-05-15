import { NavLink } from "react-router-dom";
import { useUserSession } from "../contexts/UserSessionContext";
import styles from "./Navbar.module.css";

export function Navbar() {
  const { userId, userRole } = useUserSession();

  const links = [
    { to: "/", label: "Главная", end: true },
    { to: "/auctions", label: "Аукционы" },
    // Only sellers can create listings and auctions
    ...(userRole === "SELLER"
      ? [
          { to: "/listings/new", label: "Новый лот" },
          { to: "/auctions/new", label: "Новый аукцион" }
        ]
      : []),
    // Only admin can moderate
    ...(userRole === "ADMIN"
      ? [{ to: "/moderation", label: "Модерация" }]
      : []),
    { to: "/profile", label: "Профиль" }
  ];

  return (
    <nav className={styles.nav} aria-label="Основная навигация">
      <ul className={styles.list}>
        {links.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`.trim()}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}