import styles from "./Button.module.css";

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  ...rest
}) {
  const variantClass = styles[variant] ?? styles.primary;
  return (
    <button
      type={type}
      className={`${styles.btn} ${variantClass} ${className}`.trim()}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
