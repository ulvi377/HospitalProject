
export default function ConfirmDialog({
  isOpen,
  title = "Təsdiq",
  message = "Davam etmək istəyirsiniz?",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          color: "#222",
          padding: 24,
          borderRadius: 12,
          width: "min(400px, 90%)",
        }}
      >
        <h3>{title}</h3>
        <p>{message}</p>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel}>Ləğv et</button>
          <button onClick={onConfirm}>Təsdiqlə</button>
        </div>
      </div>
    </div>
  );
}
