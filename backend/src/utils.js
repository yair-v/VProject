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

  // Excel serial number
  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const result = new Date(excelEpoch);
    result.setUTCDate(excelEpoch.getUTCDate() + Math.floor(value));

    return result.toISOString().slice(0, 10);
  }

  const str = String(value).trim();

  // כבר תקין
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // 🇮🇱 DD/MM/YYYY
  let match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    let [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  // 🇺🇸 MM/DD/YY או MM/DD/YYYY
  match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (match) {
    let [, mm, dd, yy] = match;

    if (yy.length === 2) {
      yy = `20${yy}`;
    }

    return `${yy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  // fallback
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return null;
}

export function toDisplayDate(value) {
  if (!value && value !== 0) return '';

  const str = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return String(value);

  const [yyyy, mm, dd] = str.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

export function todayDbDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy}`;
}