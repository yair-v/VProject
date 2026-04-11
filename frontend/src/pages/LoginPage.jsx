import { useState } from 'react';
import { api } from '../api';
import AppBrand from '../components/AppBrand';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await api.login({ username, password });
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card glass-card card">
        <AppBrand />
        <div className="section-chip">Secure Login</div>
        <h1 className="login-title">התחברות למערכת</h1>
        <p className="login-subtitle">כניסה עם שם משתמש וסיסמה מוצפנת בשרת.</p>
        <form className="row-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>שם משתמש</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="field">
            <span>סיסמה</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'נכנס...' : 'כניסה'}</button>
        </form>
        <div className="login-tip">ברירת מחדל ראשונית: admin / admin1234</div>
        {error && <div className="error-box">{error}</div>}
      </div>
    </div>
  );
}
