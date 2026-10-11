
import { useEffect } from "react";

export default function Modal({ title, onClose, wide = false, children }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="ui-modal-overlay" onMouseDown={onClose}>
      <section
        className={`ui-modal ${wide ? "wide" : ""}`}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="ui-modal-header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Bağla">
            ✕
          </button>
        </header>

        <div className="ui-modal-body">{children}</div>
      </section>
    </div>
  );
}
