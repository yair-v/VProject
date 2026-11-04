import { useEffect, useRef, useState } from 'react';

/** Centralized presentation for existing inline errors and legacy alert() messages. */
export default function GlobalErrorPopup() {
  const [message, setMessage] = useState('');
  const lastSeen = useRef(new WeakMap());
  const timer = useRef(null);

  useEffect(() => {
    const show = (value) => {
      const text = String(value || '').trim();
      if (!text) return;
      setMessage(text);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMessage(''), 6500);
    };
    const originalAlert = window.alert;
    window.alert = (value) => show(value);
    const onCustomError = (event) => show(event.detail?.message || event.detail);
    window.addEventListener('vproject:error', onCustomError);
    const scan = () => {
      document.querySelectorAll('.error-box').forEach((node) => {
        const text = node.textContent?.trim();
        if (text && lastSeen.current.get(node) !== text) {
          lastSeen.current.set(node, text);
          show(text);
        }
      });
    };
    const observer = new MutationObserver(scan);
    observer.observe(document.getElementById('root'), { subtree: true, childList: true, characterData: true });
    scan();
    return () => {
      observer.disconnect();
      window.alert = originalAlert;
      window.removeEventListener('vproject:error', onCustomError);
      window.clearTimeout(timer.current);
    };
  }, []);

  if (!message) return null;
  return (
    <div className="vproject-error-layer" role="presentation">
      <div className="vproject-error-popup" role="alertdialog" aria-modal="false" aria-labelledby="vproject-error-title" aria-describedby="vproject-error-message" dir="rtl">
        <div className="vproject-error-icon" aria-hidden="true">!</div>
        <div className="vproject-error-content">
          <strong id="vproject-error-title">שגיאה</strong>
          <p id="vproject-error-message">{message}</p>
        </div>
        <button type="button" className="vproject-error-close" aria-label="סגירת הודעת שגיאה" onClick={() => setMessage('')}>×</button>
      </div>
    </div>
  );
}
