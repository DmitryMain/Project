import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import styles from "./Modal.module.css";

export function Modal({ open, title, children, onClose, footer }) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          {title ? (
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          ) : null}
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer ? (
          <div className={styles.footer}>{footer}</div>
        ) : (
          <div className={styles.footer}>
            <Button variant="primary" onClick={onClose}>
              OK
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
