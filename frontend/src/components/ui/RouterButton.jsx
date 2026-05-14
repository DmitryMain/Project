import { Link } from "react-router-dom";
import btn from "./Button.module.css";

export function RouterButton({ to, variant = "primary", children, className = "" }) {
  const variantClass = btn[variant] ?? btn.primary;
  return (
    <Link to={to} className={`${btn.btn} ${variantClass} ${className}`.trim()}>
      {children}
    </Link>
  );
}
