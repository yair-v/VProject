import { useEffect, useState } from 'react';

export default function GlobalErrorPopup() {
  const [popup, setPopup] = useState(null);
  useEffect(() => {
    const originalAlert = window.alert;
    const show = (detail) => {
      const data = typeof detail === 'string' ? { message: detail } : (detail || {});
      if (!String(data.message || '').trim()) return;
      setPopup({ title: data.title || 'הודעה', message: String(data.message), type: data.type || 'error' });
    };
    window.alert = (message) => show({ message, title: 'הודעה', type: 'info' });
    const onPopup = (event) => show(event.detail);
    const onError = (event) => show({ message: event.detail?.message || event.detail, title: 'שגיאה' });
    window.addEventListener('vproject:popup', onPopup);
    window.addEventListener('vproject:error', onError);
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.error-box').forEach((node) => {
        const msg = node.textContent?.trim();
        if (msg && node.dataset.popupSeen !== msg) {
          node.dataset.popupSeen = msg;
          show({ title: 'שגיאה', message: msg });
        }
      });
    });
    const root = document.getElementById('root');
    if (root) observer.observe(root, { subtree: true, childList: true, characterData: true });
    return () => { observer.disconnect(); window.alert = originalAlert; window.removeEventListener('vproject:popup', onPopup); window.removeEventListener('vproject:error', onError); };
  }, []);
  if (!popup) return null;
  return <div className="vproject-error-layer" role="presentation" onMouseDown={() => setPopup(null)}>
    <div className="vproject-error-popup" role="alertdialog" aria-modal="true" aria-labelledby="vp-popup-title" aria-describedby="vp-popup-message" dir="rtl" onMouseDown={e => e.stopPropagation()}>
      <div className="vproject-error-icon" aria-hidden="true">{popup.type === 'success' ? '✓' : '!'}</div>
      <div className="vproject-error-content"><strong id="vp-popup-title">{popup.title}</strong><p id="vp-popup-message" style={{whiteSpace:'pre-line'}}>{popup.message}</p><button type="button" onClick={() => setPopup(null)} style={{marginTop:14}}>אישור</button></div>
      <button type="button" className="vproject-error-close" aria-label="סגירה" onClick={() => setPopup(null)}>×</button>
    </div>
  </div>;
}
