import { useEffect, useRef, useState } from 'react';

export default function LookupInput({ label, value, onChange, loadOptions, onCreate, placeholder = '', required = false }) {
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const shellRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (shellRef.current && !shellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      try {
        const data = await loadOptions(value || '');
        if (active) setOptions(data || []);
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [value, loadOptions]);

  async function handleCreate() {
    if (!value?.trim()) return;
    const created = await onCreate(value.trim());
    onChange(created.name);
    setOpen(false);
  }

  return (
    <label className="field lookup-shell" ref={shellRef}>
      <span>{label}{required ? ' *' : ''}</span>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
      />
      {open && (
        <div className="lookup-dropdown">
          {loading ? (
            <div className="lookup-option">טוען...</div>
          ) : (
            <>
              {options.map((option) => (
                <button key={option.id} type="button" className="lookup-option" onClick={() => { onChange(option.name); setOpen(false); }}>
                  {option.name}
                </button>
              ))}
              {!!value?.trim() && !options.some((option) => option.name === value.trim()) && (
                <button type="button" className="lookup-option" onClick={handleCreate}>
                  הוסף "{value.trim()}"
                </button>
              )}
            </>
          )}
        </div>
      )}
    </label>
  );
}
