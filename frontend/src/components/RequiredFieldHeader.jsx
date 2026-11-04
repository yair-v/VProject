export default function RequiredFieldHeader({ label, required, onToggle, busy = false }) {
  return <span className="required-field-header">
    <span className="required-field-name">{label}{required ? ' *' : ''}</span>
    <span className="mini-required-toggle" title={required ? 'חובה – לחץ לשינוי לרשות' : 'רשות – לחץ לשינוי לחובה'}>
      <input type="checkbox" checked={Boolean(required)} disabled={busy} onChange={(e) => onToggle(e.target.checked)} aria-label={`${label}: ${required ? 'חובה' : 'רשות'}`} />
      <span className="mini-required-track" aria-hidden="true" />
    </span>
  </span>;
}
