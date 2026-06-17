import { Link } from "react-router-dom";
import { Navbar } from "./Navbar";
import logo from "../assets/logo192.png";
import styles from "./Header.module.css";

export function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link to="/" className={styles.brand}>
                    <img src={logo} alt="Gadget Market" className={styles.logo} />
                    <span className={styles.name}>Gadget Market</span>
                </Link>
                <Navbar />
            </div>
        </header>
    );
}