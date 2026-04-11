import { useState } from 'react';

export default function FloatingMenu({
  user,
  onDashboard,
  onProjects,
  onSettings,
  onBack,
  onLogout
}) {
  const [open, setOpen] = useState(false);

  function handleAction(action) {
    setOpen(false);
    action();
  }

  return (
    <div className={`floating-menu ${open ? 'open' : ''}`}>
      <div className="floating-menu-actions">
        <button
          type="button"
          className="floating-menu-item"
          onClick={() => handleAction(onDashboard)}
        >
          <span>🏠</span>
          <span>דשבורד</span>
        </button>

        <button
          type="button"
          className="floating-menu-item"
          onClick={() => handleAction(onProjects)}
        >
          <span>📁</span>
          <span>פרויקטים</span>
        </button>

        <button
          type="button"
          className="floating-menu-item"
          onClick={() => handleAction(onSettings)}
        >
          <span>⚙️</span>
          <span>הגדרות</span>
        </button>

        <button
          type="button"
          className="floating-menu-item"
          onClick={() => handleAction(onBack)}
        >
          <span>↩️</span>
          <span>חזרה</span>
        </button>

        <button
          type="button"
          className="floating-menu-item"
          onClick={() => handleAction(onLogout)}
        >
          <span>🚪</span>
          <span>התנתק</span>
        </button>

        <div className="floating-menu-user">
          {user?.username} / {user?.role}
        </div>
      </div>

      <button
        type="button"
        className="floating-menu-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="פתח תפריט"
      >
        <span className="floating-menu-toggle-icon">☰</span>
      </button>
    </div>
  );
}