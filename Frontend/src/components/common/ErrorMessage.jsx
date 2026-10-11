
export default function ErrorMessage({
  message = "Xəta baş verdi.",
  onRetry,
}) {
  return (
    <div
      role="alert"
      style={{
        padding: "16px",
        margin: "12px 0",
        borderRadius: "8px",
        background: "#fef2f2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
      }}
    >
      <p style={{ margin: 0 }}>{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{ marginTop: "10px", cursor: "pointer" }}
        >
          Yenidən cəhd et
        </button>
      )}
    </div>
  );
}
