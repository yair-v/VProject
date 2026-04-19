export default function CustomFieldInput({ field, value, onChange }) {
  const safeValue = value ?? '';

  if (field.field_type === 'boolean') {
    return (
      <label className="field">
        <span>{field.field_label}{field.is_required ? ' *' : ''}</span>
        <select value={safeValue === true ? 'true' : safeValue === false ? 'false' : ''} onChange={(e) => onChange(e.target.value === '' ? '' : e.target.value === 'true')}>
          <option value="">בחר</option>
          <option value="true">כן</option>
          <option value="false">לא</option>
        </select>
      </label>
    );
  }

  if (field.field_type === 'select') {
    return (
      <label className="field">
        <span>{field.field_label}{field.is_required ? ' *' : ''}</span>
        <select value={safeValue} onChange={(e) => onChange(e.target.value)}>
          <option value="">בחר</option>
          {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  if (field.field_type === 'date') {
    return (
      <label className="field">
        <span>{field.field_label}{field.is_required ? ' *' : ''}</span>
        <input value={safeValue} placeholder="DD/MM/YYYY" onChange={(e) => onChange(e.target.value)} />
      </label>
    );
  }

  return (
    <label className="field">
      <span>{field.field_label}{field.is_required ? ' *' : ''}</span>
      <input type={field.field_type === 'number' ? 'text' : 'text'} inputMode={field.field_type === 'number' ? 'decimal' : undefined} value={safeValue} onChange={(e) => onChange(field.field_type === 'number' ? e.target.value.replace(/[^0-9.\-]/g, '') : e.target.value)} />
    </label>
  );
}
