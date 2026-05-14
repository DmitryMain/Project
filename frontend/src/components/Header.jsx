import { Link } from "react-router-dom";
import { Navbar } from "./Navbar";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.mark} aria-hidden />
          <span className={styles.name}>Gadget Market</span>
        </Link>
        <Navbar />
      </div>
    </header>
  );
}
