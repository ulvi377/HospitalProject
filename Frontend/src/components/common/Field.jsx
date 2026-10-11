
export default function Field({ label, hint, children }) {
  return (
    <label className="ui-field">
      <span className="ui-field-label">{label}</span>
      {children}
      {hint && <small className="ui-field-hint">{hint}</small>}
    </label>
  );
}
