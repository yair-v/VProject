import { useMemo, useState } from 'react';
import { api } from '../api';

const TYPE_OPTIONS = [
  { value: 'text', label: 'טקסט' },
  { value: 'number', label: 'מספר' },
  { value: 'date', label: 'תאריך' },
  { value: 'select', label: 'רשימת בחירה' },
  { value: 'boolean', label: 'כן / לא' }
];

function emptyField(nextOrder = 0) {
  return { field_label: '', field_type: 'text', is_required: false, options_text: '', sort_order: nextOrder };
}

export default function ProjectFieldsManager({ projectId, customFields, onChanged, canManage = true }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(emptyField(customFields.length));

  const sortedFields = useMemo(() => [...customFields].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)), [customFields]);

  async function createField() {
    try {
      setError('');
      await api.createProjectField(projectId, {
        field_label: draft.field_label,
        field_type: draft.field_type,
        is_required: draft.is_required,
        options: draft.options_text,
        sort_order: draft.sort_order
      });
      setDraft(emptyField(customFields.length + 1));
      await onChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateField(field, patch) {
    try {
      setError('');
      await api.updateProjectField(projectId, field.id, {
        field_label: patch.field_label ?? field.field_label,
        field_type: patch.field_type ?? field.field_type,
        is_required: patch.is_required ?? field.is_required,
        options: patch.options_text ?? (field.options || []).join(', '),
        sort_order: patch.sort_order ?? field.sort_order,
        is_active: true
      });
      await onChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeField(field) {
    if (!window.confirm(`למחוק את השדה "${field.field_label}"?`)) return;
    try {
      setError('');
      await api.deleteProjectField(projectId, field.id);
      await onChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="card glass-card settings-panel">
      <div className="card-title-row">
        <div>
          <div className="section-chip">Project Fields</div>
          <h3>שדות לפרויקט הנוכחי</h3>
        </div>
        <div className="toolbar-actions">
          <span className="rows-badge">שדות בסיס נעולים</span>
          {canManage && <button type="button" className="secondary-btn" onClick={() => setOpen((prev) => !prev)}>{open ? 'סגור' : 'נהל שדות'}</button>}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>שם שדה</th>
              <th>סוג</th>
              <th>חובה</th>
              <th>אפשרויות</th>
              <th>סדר</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {sortedFields.length ? sortedFields.map((field) => (
              <tr key={field.id}>
                <td>{field.field_label}</td>
                <td>{TYPE_OPTIONS.find((item) => item.value === field.field_type)?.label || field.field_type}</td>
                <td>{field.is_required ? 'כן' : 'לא'}</td>
                <td>{field.field_type === 'select' ? (field.options || []).join(', ') : '-'}</td>
                <td>{field.sort_order ?? 0}</td>
                <td>
                  {canManage ? (
                    <div className="row-actions">
                      <button type="button" onClick={() => {
                        const nextLabel = window.prompt('שם שדה חדש', field.field_label);
                        if (!nextLabel?.trim()) return;
                        updateField(field, { field_label: nextLabel.trim() });
                      }}>ערוך</button>
                      <button type="button" onClick={() => {
                        const nextRequired = !field.is_required;
                        updateField(field, { is_required: nextRequired });
                      }}>{field.is_required ? 'בטל חובה' : 'הפוך לחובה'}</button>
                      <button type="button" className="danger" onClick={() => removeField(field)}>מחק</button>
                    </div>
                  ) : '—'}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="empty">אין עדיין שדות מותאמים לפרויקט</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && canManage && (
        <div className="settings-grid">
          <label className="field">
            <span>שם שדה חדש</span>
            <input value={draft.field_label} onChange={(e) => setDraft((prev) => ({ ...prev, field_label: e.target.value }))} />
          </label>
          <label className="field">
            <span>סוג שדה</span>
            <select value={draft.field_type} onChange={(e) => setDraft((prev) => ({ ...prev, field_type: e.target.value }))}>
              {TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="field">
            <span>סדר</span>
            <input type="number" value={draft.sort_order} onChange={(e) => setDraft((prev) => ({ ...prev, sort_order: Number(e.target.value || 0) }))} />
          </label>
          <label className="field">
            <span>חובה?</span>
            <select value={draft.is_required ? 'true' : 'false'} onChange={(e) => setDraft((prev) => ({ ...prev, is_required: e.target.value === 'true' }))}>
              <option value="false">לא</option>
              <option value="true">כן</option>
            </select>
          </label>
          {draft.field_type === 'select' && (
            <label className="field">
              <span>אפשרויות (מופרדות בפסיק)</span>
              <input value={draft.options_text} onChange={(e) => setDraft((prev) => ({ ...prev, options_text: e.target.value }))} placeholder="קטן, בינוני, גדול" />
            </label>
          )}
          <div className="form-actions">
            <button type="button" className="primary-btn" onClick={createField}>הוסף שדה</button>
          </div>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}
    </section>
  );
}
