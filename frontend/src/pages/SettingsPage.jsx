import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import AppBrand from '../components/AppBrand';

function DisplaySettingsTab({ displaySettings, setDisplaySettings }) {
  return (
    <section className="card glass-card settings-panel">
      <div className="card-title-row">
        <div>
          <div className="section-chip">Display</div>
          <h3>תצוגה</h3>
        </div>
      </div>

      <div className="settings-grid">
        <label className="field">
          <span>ערכת נושא</span>
          <div className="segmented-status">
            <button
              type="button"
              className={displaySettings.theme === 'dark' ? 'active' : ''}
              onClick={() => setDisplaySettings((prev) => ({ ...prev, theme: 'dark' }))}
            >
              כהה
            </button>

            <button
              type="button"
              className={displaySettings.theme === 'light' ? 'active' : ''}
              onClick={() => setDisplaySettings((prev) => ({ ...prev, theme: 'light' }))}
            >
              בהיר
            </button>
          </div>
        </label>

        <label className="field">
          <span>זום: {displaySettings.zoom}%</span>
          <input
            type="range"
            min="75"
            max="125"
            step="5"
            value={displaySettings.zoom}
            onChange={(e) =>
              setDisplaySettings((prev) => ({
                ...prev,
                zoom: Number(e.target.value)
              }))
            }
          />
        </label>
      </div>
    </section>
  );
}

function UsersTab({ user }) {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager');
  const [error, setError] = useState('');
  const [twofaModal, setTwofaModal] = useState(null);
  const [twofaCode, setTwofaCode] = useState('');
  const [loading2FA, setLoading2FA] = useState(false);

  async function loadUsers() {
    try {
      setUsers(await api.getUsers());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (user.role === 'admin') loadUsers();
  }, [user.role]);

  async function createUser() {
    try {
      await api.createUser({ username, password, role });
      setUsername('');
      setPassword('');
      setRole('manager');
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeRole(item, newRole) {
    try {
      await api.updateUserRole(item.id, newRole);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function changePassword(item) {
    const newPassword = window.prompt(`סיסמה חדשה עבור ${item.username}`);
    if (!newPassword?.trim()) return;

    try {
      await api.updateUserPassword(item.id, newPassword.trim());
      setError('');
      window.alert('הסיסמה עודכנה');
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeUser(item) {
    if (!window.confirm(`למחוק את המשתמש ${item.username}?`)) return;

    try {
      await api.deleteUser(item.id);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function setup2FA(item) {
    setLoading2FA(true);
    setError('');
    setTwofaCode('');

    try {
      const result = await api.setupUser2FA(item.id);
      setTwofaModal({
        user: item,
        qr: result.qr,
        secret: result.secret
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading2FA(false);
    }
  }

  async function enable2FA() {
    if (!twofaModal?.user?.id) return;
    if (!twofaCode.trim()) {
      setError('יש להזין קוד 2FA');
      return;
    }

    setLoading2FA(true);
    setError('');

    try {
      await api.enableUser2FA(twofaModal.user.id, twofaCode.trim());
      setTwofaModal(null);
      setTwofaCode('');
      await loadUsers();
      window.alert('2FA הופעל בהצלחה');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading2FA(false);
    }
  }

  async function disable2FA(item) {
    if (!window.confirm(`לבטל 2FA עבור ${item.username}?`)) return;

    setLoading2FA(true);
    setError('');

    try {
      await api.disableUser2FA(item.id);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading2FA(false);
    }
  }

  if (user.role !== 'admin') {
    return (
      <section className="card glass-card settings-panel">
        <div className="empty">אין הרשאה לניהול משתמשים</div>
      </section>
    );
  }

  return (
    <section className="card glass-card settings-panel">
      <div className="card-title-row">
        <div>
          <div className="section-chip">Users</div>
          <h3>ניהול משתמשים</h3>
        </div>
      </div>

      <div className="settings-grid">
        <label className="field">
          <span>שם משתמש</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>

        <label className="field">
          <span>סיסמה</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        <label className="field">
          <span>רמה</span>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="manager">אחראי</option>
            <option value="admin">מנהל</option>
          </select>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="primary-btn" onClick={createUser}>
          צור משתמש
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>שם משתמש</th>
              <th>רמה</th>
              <th>2FA</th>
              <th>נוצר</th>
              <th>פעולות</th>
            </tr>
          </thead>

          <tbody>
            {users.map((item) => (
              <tr key={item.id}>
                <td>{item.username}</td>

                <td>
                  <select
                    value={item.role}
                    onChange={(e) => changeRole(item, e.target.value)}
                  >
                    <option value="manager">אחראי</option>
                    <option value="admin">מנהל</option>
                  </select>
                </td>

                <td>
                  {item.twofa_enabled ? (
                    <span className="ok-pill">פעיל</span>
                  ) : (
                    <span className="warn-pill">לא פעיל</span>
                  )}
                </td>

                <td>{String(item.created_at || '').slice(0, 10)}</td>

                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => changePassword(item)}>
                      שנה סיסמה
                    </button>

                    {item.twofa_enabled ? (
                      <button
                        type="button"
                        className="danger"
                        onClick={() => disable2FA(item)}
                        disabled={loading2FA}
                      >
                        בטל 2FA
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setup2FA(item)}
                        disabled={loading2FA}
                      >
                        הפעל 2FA
                      </button>
                    )}

                    <button
                      type="button"
                      className="danger"
                      onClick={() => removeUser(item)}
                    >
                      מחק
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {twofaModal && (
        <div className="field-modal-backdrop" onClick={() => setTwofaModal(null)}>
          <div className="field-modal card glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="field-modal-header">
              <div>
                <div className="section-chip">2FA</div>
                <h3>הפעלת אימות דו־שלבי</h3>
              </div>

              <button
                type="button"
                className="field-modal-close"
                onClick={() => setTwofaModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="field-modal-body">
              <div className="field field-full">
                <span>משתמש</span>
                <strong>{twofaModal.user.username}</strong>
              </div>

              <div className="field field-full">
                <span>סרוק את הקוד באפליקציית Google Authenticator / Microsoft Authenticator</span>
                <div style={{ textAlign: 'center', padding: 12 }}>
                  <img
                    src={twofaModal.qr}
                    alt="2FA QR"
                    style={{
                      width: 220,
                      height: 220,
                      maxWidth: '100%',
                      background: '#fff',
                      borderRadius: 16,
                      padding: 10
                    }}
                  />
                </div>
              </div>

              <label className="field field-full">
                <span>קוד אימות מהאפליקציה</span>
                <input
                  value={twofaCode}
                  onChange={(e) => setTwofaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                />
              </label>

              <div className="field field-full">
                <span>קוד ידני לגיבוי</span>
                <input readOnly value={twofaModal.secret || ''} />
              </div>
            </div>

            <div className="field-modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setTwofaModal(null)}
              >
                ביטול
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={enable2FA}
                disabled={loading2FA}
              >
                {loading2FA ? 'מאמת...' : 'אמת והפעל 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function TablesTab() {
  const [customers, setCustomers] = useState([]);
  const [installers, setInstallers] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [installerName, setInstallerName] = useState('');
  const [error, setError] = useState('');

  async function loadData() {
    try {
      setCustomers(await api.getCustomers(''));
      setInstallers(await api.getInstallers(''));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addCustomer() {
    try {
      await api.createCustomer(customerName);
      setCustomerName('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addInstaller() {
    try {
      await api.createInstaller(installerName);
      setInstallerName('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function renameCustomer(item) {
    const name = window.prompt('שם חדש ללקוח', item.name);
    if (name?.trim()) {
      try {
        await api.updateCustomer(item.id, name.trim());
        loadData();
      } catch (err) {
        setError(err.message);
      }
    }
  }

  async function removeCustomer(item) {
    if (window.confirm(`למחוק את ${item.name}?`)) {
      try {
        await api.deleteCustomer(item.id);
        loadData();
      } catch (err) {
        setError(err.message);
      }
    }
  }

  async function renameInstaller(item) {
    const name = window.prompt('שם חדש למתקין', item.name);
    if (name?.trim()) {
      try {
        await api.updateInstaller(item.id, name.trim());
        loadData();
      } catch (err) {
        setError(err.message);
      }
    }
  }

  async function removeInstaller(item) {
    if (window.confirm(`למחוק את ${item.name}?`)) {
      try {
        await api.deleteInstaller(item.id);
        loadData();
      } catch (err) {
        setError(err.message);
      }
    }
  }

  return (
    <section className="settings-tables-grid">
      <section className="card glass-card settings-panel">
        <div className="card-title-row">
          <div>
            <div className="section-chip">Tables</div>
            <h3>טבלת לקוחות</h3>
          </div>
        </div>

        <div className="form-actions">
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="לקוח חדש"
          />
          <button type="button" className="primary-btn" onClick={addCustomer}>
            הוסף
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>שם</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" onClick={() => renameCustomer(item)}>ערוך</button>
                      <button type="button" className="danger" onClick={() => removeCustomer(item)}>מחק</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card glass-card settings-panel">
        <div className="card-title-row">
          <div>
            <div className="section-chip">Tables</div>
            <h3>טבלת מתקינים</h3>
          </div>
        </div>

        <div className="form-actions">
          <input
            value={installerName}
            onChange={(e) => setInstallerName(e.target.value)}
            placeholder="מתקין חדש"
          />
          <button type="button" className="primary-btn" onClick={addInstaller}>
            הוסף
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>שם</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {installers.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" onClick={() => renameInstaller(item)}>ערוך</button>
                      <button type="button" className="danger" onClick={() => removeInstaller(item)}>מחק</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {error && <div className="error-box">{error}</div>}
    </section>
  );
}

export default function SettingsPage({
  user,
  onBack,
  onLogout,
  displaySettings,
  setDisplaySettings
}) {
  const tabs = useMemo(() => [
    { key: 'display', label: 'תצוגה' },
    { key: 'tables', label: 'טבלאות' },
    ...(user.role === 'admin' ? [{ key: 'users', label: 'משתמשים' }] : [])
  ], [user.role]);

  const [activeTab, setActiveTab] = useState(tabs[0].key);

  useEffect(() => {
    if (!tabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(tabs[0].key);
    }
  }, [tabs, activeTab]);

  return (
    <div className="app-shell app-shell-projects">
      <main className="main-panel single-panel">
        <section className="hero-with-brand">
          <section className="toolbar card glass-card hero-toolbar">
            <div>
              <div className="section-chip">Settings</div>
              <h2>הגדרות מערכת</h2>
              <p>ניהול משתמשים, 2FA, תצוגה, זום וטבלאות בסיס.</p>
            </div>

            <div className="toolbar-actions">
              <button type="button" className="secondary-btn" onClick={onBack}>חזרה</button>
              <button type="button" className="secondary-btn" onClick={onLogout}>התנתק</button>
              <span className="rows-badge">{user.username} / {user.role}</span>
            </div>
          </section>

          <AppBrand />
        </section>

        <section className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {activeTab === 'display' && (
          <DisplaySettingsTab
            displaySettings={displaySettings}
            setDisplaySettings={setDisplaySettings}
          />
        )}

        {activeTab === 'tables' && <TablesTab />}
        {activeTab === 'users' && <UsersTab user={user} />}
      </main>
    </div>
  );
}