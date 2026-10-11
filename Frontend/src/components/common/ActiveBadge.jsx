
export default function ActiveBadge({ active }) {
  return (
    <span className={`ui-badge ${active ? "active" : "inactive"}`}>
      {active ? "Aktiv" : "Deaktiv"}
    </span>
  );
}
