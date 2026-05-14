import styles from "./Input.module.css";

export function Input({ label, hint, error, id, className = "", ...rest }) {
  const inputId = id ?? rest.name;
  return (
    <div className={`${styles.field} ${className}`.trim()}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input id={inputId} className={`${styles.input} ${error ? styles.inputError : ""}`.trim()} {...rest} />
      {error ? <span className={styles.error}>{error}</span> : null}
      {!error && hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}
