
export default function PageHeader({
  title,
  subtitle,
  action,
  children,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        marginBottom: "24px",
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              margin: "8px 0 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            {subtitle}
          </p>
        )}

        {children}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
