
import React from "react";

export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  const colors = {
    success: "#16a34a",
    error: "#dc2626",
    warning: "#d97706",
    info: "#2563eb",
  };

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        padding: "14px 20px",
        borderRadius: "8px",
        background: colors[type] || colors.info,
        color: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Bağla"
          style={{
            marginLeft: "16px",
            border: 0,
            background: "transparent",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
