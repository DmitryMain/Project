import styles from "./Loader.module.css";

export function Loader({ label = "Загрузка…" }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden />
      {label ? <span className={styles.label}>{label}</span> : null}
    </div>
  );
}
