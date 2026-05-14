import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>© {new Date().getFullYear()} Gadget Market</p>
        <p className={styles.note}>Маркетплейс гаджетов с аукционами</p>
      </div>
    </footer>
  );
}
