import styles from "./Select.module.css";

export function Select({ label, hint, error, id, children, className = "", ...rest }) {
  const selectId = id ?? rest.name;
  return (
    <div className={`${styles.field} ${className}`.trim()}>
      {label ? (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <div className={styles.wrap}>
        <select id={selectId} className={`${styles.select} ${error ? styles.selectError : ""}`.trim()} {...rest}>
          {children}
        </select>
      </div>
      {error ? <span className={styles.error}>{error}</span> : null}
      {!error && hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}
