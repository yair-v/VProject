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

  function buildDate(year, month, day) {
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }
    const yyyy = String(year).padStart(4, '0');
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return buildDate(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const asDate = excelSerialToDate(value);
    return buildDate(asDate.getUTCFullYear(), asDate.getUTCMonth() + 1, asDate.getUTCDate());
  }

  const str = String(value).trim();
  if (!str) return null;

  let match = str.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (match) {
    return buildDate(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  if (/^\d{5}(\.\d+)?$/.test(str)) {
    const asDate = excelSerialToDate(Number(str));
    return buildDate(asDate.getUTCFullYear(), asDate.getUTCMonth() + 1, asDate.getUTCDate());
  }

  // Israeli format only: dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy.
  match = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2}|\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    let year = Number(match[3]);
    if (year < 100) year += 2000;
    return buildDate(year, month, day);
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