
export default function Loading({
  message = "Yüklənir...",
  fullScreen = false,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "32px 16px",
        minHeight: fullScreen ? "100vh" : "120px",
        color: "#0f766e",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          border: "4px solid #ccfbf1",
          borderTopColor: "#0f766e",
          borderRadius: "50%",
          animation: "hospital-loading-spin 0.8s linear infinite",
        }}
      />

      <span>{message}</span>

      <style>
        {`
          @keyframes hospital-loading-spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
