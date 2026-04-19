import { useEffect, useMemo, useState } from 'react';
import LookupInput from '../components/LookupInput';
import { api } from '../api';
import AppBrand from '../components/AppBrand';
import ProjectClock from '../components/ProjectClock';
import ProjectFieldsManager from '../components/ProjectFieldsManager';
import CustomFieldInput from '../components/CustomFieldInput';

export default function RowsPage({
  projects,
  selectedProject,
  rowsData,
  loadingRows,
  loadingProjects,
  error,
  search,
  setSearch,
  status,
  setStatus,
  form,
  setForm,
  editingRowId,
  updateForm,
  resetForm,
  saveRow,
  startEdit,
  deleteRow,
  loadRows,
  handleExport,
  goToProjects,
  goToImport,
  setSelectedProject,
  refreshKey,
  openSettings,
  user
}) {
  const totalProjects = projects.length;
  const [projectSummary, setProjectSummary] = useState({ rows_count: 0, completed_rows: 0, pending_rows: 0 });
  const [customFields, setCustomFields] = useState([]);
  const customData = form.custom_data || {};

  async function loadProjectFields() {
    if (!selectedProject?.id) return;
    try {
      const result = await api.getProjectFields(selectedProject.id);
      setCustomFields(result.customFields || []);
    } catch {
      setCustomFields([]);
    }
  }

  useEffect(() => {
    async function loadSummary() {
      if (!selectedProject?.id) return;
      try {
        const summary = await api.getProjectSummary(selectedProject.id);
        setProjectSummary(summary);
      } catch {
        setProjectSummary({ rows_count: selectedProject?.rows_count || 0, completed_rows: selectedProject?.completed_rows || 0, pending_rows: selectedProject?.pending_rows || 0 });
      }
    }
    loadSummary();
    loadProjectFields();
  }, [selectedProject?.id, refreshKey]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, custom_data: prev.custom_data || {} }));
  }, [setForm, selectedProject?.id]);

  const visibleCustomColumns = useMemo(() => [...customFields].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)), [customFields]);

  function updateCustomField(fieldKey, value) {
    setForm((prev) => ({
      ...prev,
      custom_data: {
        ...(prev.custom_data || {}),
        [fieldKey]: value
      }
    }));
  }

  function handleStartEdit(row) {
    startEdit({ ...row, custom_data: row.custom_data || {} });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar card glass-card">
        <div className="sidebar-header">
          <div className="section-chip">Navigate</div>
          <h1>פרויקטים</h1>
          <p>בחר פרויקט ועבור בין הנושאים בדפים נפרדים.</p>
        </div>
        <div className="sidebar-nav-actions">
          <button type="button" className="secondary-btn" onClick={goToProjects}>חזרה לדף פרויקטים</button>
          <button type="button" className="settings-btn-pro" onClick={openSettings}>הגדרות</button>
        </div>
        <div className="project-list">
          {loadingProjects ? <div className="empty-sidebar-state">טוען...</div> : projects.length ? projects.map((project) => (
            <button key={project.id} type="button" className={`project-item ${project.id === selectedProject?.id ? 'active' : ''}`} onClick={() => setSelectedProject(project.id)}>
              <div className="project-item-title">{project.name}</div>
              <div className="project-item-meta"><span>{project.rows_count || 0} שורות</span>{project.description ? <small>{project.description}</small> : null}</div>
            </button>
          )) : <div className="empty-sidebar-state">אין פרויקטים</div>}
        </div>
      </aside>

      <main className="main-panel">
        <section className="hero-with-brand">
          <section className="toolbar card glass-card hero-toolbar">
            <div>
              <div className="section-chip">Rows Management</div>
              <h2>{selectedProject?.name || 'בחר פרויקט'}</h2>
              <p>{selectedProject?.description || 'ניהול שורות, טפסים, חיפוש ופעולות מהירות.'}</p>
            </div>
            <div className="toolbar-actions">
              <button type="button" className="secondary-btn" onClick={goToImport}>ייבוא Pro</button>
              <button type="button" className="secondary-btn" onClick={handleExport}>ייצוא אקסל</button>
            </div>
          </section>
          <AppBrand />
        </section>

        <section className="project-summary-grid">
          <div className="glass-card stat-box compact"><span>סה״כ פרויקטים</span><strong>{totalProjects}</strong></div>
          <div className="glass-card stat-box compact"><span>שורות בפרויקט</span><strong>{projectSummary.rows_count || 0}</strong></div>
          <div className="glass-card stat-box compact"><span>שדות מותאמים</span><strong>{visibleCustomColumns.length}</strong></div>
          <ProjectClock total={projectSummary.rows_count} completed={projectSummary.completed_rows} pending={projectSummary.pending_rows} size={132} stroke={12} title="גרף שעון" />
        </section>

        {!!selectedProject?.id && (
          <ProjectFieldsManager
            projectId={selectedProject.id}
            customFields={visibleCustomColumns}
            onChanged={async () => {
              await loadProjectFields();
              await loadRows(selectedProject.id, rowsData.page || 1);
            }}
            canManage={user.role === 'admin' || user.role === 'manager'}
          />
        )}

        <section className="content-grid">
          <section className="card form-card glass-card">
            <div className="card-title-row"><div><div className="section-chip">Editor</div><h3>{editingRowId ? 'עריכת שורה' : 'הוספת שורה'}</h3></div></div>
            <form className="row-form" onSubmit={saveRow}>
              <LookupInput label="לקוח" value={form.customer_name} onChange={(value) => updateForm('customer_name', value)} loadOptions={api.getCustomers} onCreate={api.createCustomer} placeholder="חפש או הוסף לקוח" />
              <label className="field"><span>שם סניף</span><input value={form.branch_name} onChange={(e) => updateForm('branch_name', e.target.value)} /></label>
              <label className="field"><span>מספר סניף</span><input type="text" inputMode="numeric" maxLength={5} value={form.branch_number || ''} onChange={(e) => setForm((prev) => ({ ...prev, branch_number: e.target.value.replace(/\D/g, '').slice(0, 5) }))} /></label>
              <label className="field"><span>מספר עמדה</span><input type="text" inputMode="numeric" maxLength={5} value={form.position_number || ''} onChange={(e) => setForm((prev) => ({ ...prev, position_number: e.target.value.replace(/\D/g, '').slice(0, 5) }))} /></label>
              <label className="field"><span>מספר סידורי *</span><input type="text" inputMode="numeric" maxLength={8} value={form.serial_number || ''} onChange={(e) => setForm((prev) => ({ ...prev, serial_number: e.target.value.replace(/\D/g, '').slice(0, 8) }))} /></label>
              <LookupInput label="שם מתקין" required={form.status === 'completed'} value={form.installer_name} onChange={(value) => updateForm('installer_name', value)} loadOptions={api.getInstallers} onCreate={api.createInstaller} placeholder="חפש או הוסף מתקין" />
              <label className="field"><span>תאריך יעד</span><input value={form.target_date} placeholder="DD/MM/YYYY" onChange={(e) => updateForm('target_date', e.target.value)} /></label>
              <label className="field"><span>תאריך ביצוע</span><input value={form.completed_date} placeholder="DD/MM/YYYY" onChange={(e) => updateForm('completed_date', e.target.value)} /></label>
              <label className="field"><span>סטטוס</span><select value={form.status} onChange={(e) => updateForm('status', e.target.value)}><option value="pending">ממתין</option><option value="completed">בוצע</option></select></label>
              {visibleCustomColumns.map((field) => (
                <CustomFieldInput key={field.field_key} field={field} value={customData[field.field_key] ?? ''} onChange={(value) => updateCustomField(field.field_key, value)} />
              ))}
              <div className="segmented-status">
                <button type="button" className={form.status === 'pending' ? 'active' : ''} onClick={() => updateForm('status', 'pending')}>ממתין</button>
                <button type="button" className={form.status === 'completed' ? 'active' : ''} onClick={() => updateForm('status', 'completed')}>בוצע</button>
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-btn">{editingRowId ? 'שמור שינויים' : 'הוסף שורה'}</button>
                {editingRowId && <button type="button" className="secondary-btn" onClick={resetForm}>ביטול</button>}
              </div>
            </form>
            {error && <div className="error-box">{error}</div>}
          </section>

          <section className="card table-card glass-card">
            <div className="card-title-row table-top-pro">
              <div><div className="section-chip">Main Table Pro</div><h3>טבלת שורות</h3></div>
              <div className="toolbar-actions">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש חכם..." />
                <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">כל הסטטוסים</option><option value="pending">ממתין</option><option value="completed">בוצע</option></select>
              </div>
            </div>
            <div className="table-meta">
              <strong>{rowsData.total} שורות</strong>
              <div className="pagination">
                <button type="button" disabled={rowsData.page <= 1} onClick={() => loadRows(selectedProject?.id, rowsData.page - 1)}>הקודם</button>
                <span>עמוד {rowsData.page}</span>
                <button type="button" disabled={rowsData.page * rowsData.pageSize >= rowsData.total} onClick={() => loadRows(selectedProject?.id, rowsData.page + 1)}>הבא</button>
              </div>
            </div>
            <div className="table-wrap pro-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>לקוח</th><th>שם סניף</th><th>מספר סניף</th><th>מספר עמדה</th><th>מספר סידורי</th><th>שם מתקין</th><th>תאריך יעד</th><th>תאריך ביצוע</th><th>סטטוס</th>
                    {visibleCustomColumns.map((field) => <th key={field.field_key}>{field.field_label}</th>)}
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRows ? <tr><td colSpan={10 + visibleCustomColumns.length} className="empty">טוען...</td></tr> : rowsData.rows.length ? rowsData.rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.customer_name}</td><td>{row.branch_name}</td><td>{row.branch_number}</td><td>{row.position_number}</td><td className="serial-cell">{row.serial_number}</td><td>{row.installer_name}</td><td>{row.target_date}</td><td>{row.completed_date}</td>
                      <td><span className={`status ${row.status}`}>{row.status_label}</span></td>
                      {visibleCustomColumns.map((field) => <td key={field.field_key}>{row.custom_data?.[field.field_key] ?? ''}</td>)}
                      <td><div className="row-actions"><button type="button" onClick={() => handleStartEdit(row)}>ערוך</button>{(user.role === 'admin' || user.role === 'manager') && <button type="button" className="danger" onClick={() => deleteRow(row.id)}>מחק</button>}</div></td>
                    </tr>
                  )) : <tr><td colSpan={10 + visibleCustomColumns.length} className="empty">אין נתונים להצגה</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
