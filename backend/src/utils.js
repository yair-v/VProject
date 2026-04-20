export function normalizeStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['completed', 'done', 'בוצע'].includes(normalized)) return 'completed';
  return 'pending';
}

export function statusLabel(value) {
  return normalizeStatus(value) === 'completed' ? 'בוצע' : 'ממתין';
}

function excelSerialToDate(serial) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const wholeDays = Math.floor(Number(serial));
  const result = new Date(excelEpoch);
  result.setUTCDate(excelEpoch.getUTCDate() + wholeDays);
  return result;
}

export function toDbDate(value) {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const yyyy = value.getUTCFullYear();
    const mm = String(value.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(value.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const asDate = excelSerialToDate(value);
    const yyyy = asDate.getUTCFullYear();
    const mm = String(asDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(asDate.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const str = String(value).trim();
  if (!str) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  if (/^\d{5}(\.\d+)?$/.test(str)) {
    const asDate = excelSerialToDate(Number(str));
    const yyyy = asDate.getUTCFullYear();
    const mm = String(asDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(asDate.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  let match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }

  match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (match) {
    let [, mm, dd, yy] = match;
    if (yy.length === 2) yy = `20${yy}`;
    return `${yy.padStart(4, '0')}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  const asDate = new Date(str);
  if (!Number.isNaN(asDate.getTime())) {
    const yyyy = asDate.getUTCFullYear();
    const mm = String(asDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(asDate.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

export function toDisplayDate(value) {
  if (value === null || value === undefined || value === '') return '';

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const dd = String(value.getUTCDate()).padStart(2, '0');
    const mm = String(value.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = value.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const str = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const clean = str.slice(0, 10);
    const [yyyy, mm, dd] = clean.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }

  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    const dd = String(parsed.getUTCDate()).padStart(2, '0');
    const mm = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = parsed.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  return str;
}

export function todayDbDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}