from pathlib import Path
p=Path('/mnt/data/workstatus/backend/src/initDb.js')
s=p.read_text()
s=s.replace("""      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),""","""      status TEXT NOT NULL DEFAULT 'pending',""")
s=s.replace("""  await query(`
    ALTER TABLE project_rows
    ADD COLUMN IF NOT EXISTS custom_data JSONB NOT NULL DEFAULT '{}'::jsonb;
  `);
""","""  await query(`
    ALTER TABLE project_rows
    ADD COLUMN IF NOT EXISTS custom_data JSONB NOT NULL DEFAULT '{}'::jsonb;
  `);

  await query(`
    ALTER TABLE project_rows
    DROP CONSTRAINT IF EXISTS project_rows_status_check;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS statuses (
      id SERIAL PRIMARY KEY,
      status_key TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#64748b',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      is_system BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    INSERT INTO statuses(status_key, label, color, sort_order, is_active, is_system)
    VALUES
      ('pending', 'ממתין', '#f59e0b', 10, true, true),
      ('completed', 'בוצע', '#22c55e', 20, true, true)
    ON CONFLICT (status_key) DO NOTHING;
  `);
""")
s=s.replace("for (const tableName of ['projects', 'project_rows', 'project_fields'])", "for (const tableName of ['projects', 'project_rows', 'project_fields', 'statuses'])")
p.write_text(s)

p=Path('/mnt/data/workstatus/backend/src/utils.js')
s=p.read_text()
s=s.replace("""export function normalizeStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['completed', 'done', 'בוצע'].includes(normalized)) return 'completed';
  return 'pending';
}

export function statusLabel(value) {
  return normalizeStatus(value) === 'completed' ? 'בוצע' : 'ממתין';
}
""","""export function normalizeStatus(value) {
  const normalized = String(value || '').trim();
  const lower = normalized.toLowerCase();
  if (['completed', 'done', 'בוצע'].includes(lower)) return 'completed';
  if (['pending', 'open', 'ממתין'].includes(lower)) return 'pending';
  return normalized || 'pending';
}

export function statusLabel(value) {
  const normalized = normalizeStatus(value);
  if (normalized === 'completed') return 'בוצע';
  if (normalized === 'pending') return 'ממתין';
  return String(value || 'ממתין');
}
""")
p.write_text(s)
