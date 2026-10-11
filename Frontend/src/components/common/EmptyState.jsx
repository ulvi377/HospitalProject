
export default function EmptyState({
  title = "Məlumat tapılmadı",
  message = "Hələlik göstəriləcək məlumat yoxdur.",
}) {
  return (
    <div
      style={{
        padding: "40px 20px",
        textAlign: "center",
        color: "#64748b",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
      <h3 style={{ color: "#334155", marginBottom: 8 }}>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
