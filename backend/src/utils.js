export function normalizeStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['completed', 'done', 'בוצע'].includes(normalized)) return 'completed';
  return 'pending';
}

export function statusLabel(value) {
  return normalizeStatus(value) === 'completed' ? 'בוצע' : 'ממתין';
}

export function toDbDate(value) {
  if (!value) return null;
  const str = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }

  const asDate = new Date(str);
  if (!Number.isNaN(asDate.getTime())) {
    const yyyy = asDate.getFullYear();
    const mm = String(asDate.getMonth() + 1).padStart(2, '0');
    const dd = String(asDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

export function toDisplayDate(value) {
  if (!value) return '';
  const str = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return '';
  const [yyyy, mm, dd] = str.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

export function todayDbDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
