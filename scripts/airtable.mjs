// Tiny Airtable Web API client for Node >= 18. No dependencies.
// Reads AIRTABLE_TOKEN and AIRTABLE_BASE_ID from .env (never from code).
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseBaseId } from '../js/airtable-map.js';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function loadEnv() {
  const file = join(root, '.env');
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = parseBaseId(process.env.AIRTABLE_BASE_ID);
  if (!token || !baseId) throw new Error('Set AIRTABLE_TOKEN and AIRTABLE_BASE_ID in .env (see .env.example)');
  return { token, baseId };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function client({ token, baseId }) {
  async function call(path, { method = 'GET', body } = {}) {
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(`https://api.airtable.com/v0/${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      // 429 = rate limit (5 requests/s per base). Wait and retry; the writes are upserts, so a retry is safe.
      if (res.status === 429 && attempt < 5) { await sleep(1000 * (attempt + 1)); continue; }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(`Airtable ${method} ${path.split('?')[0]} -> ${res.status} ${JSON.stringify(json.error || json)}`);
      return json;
    }
  }

  return {
    baseId,
    listTables: () => call(`meta/bases/${baseId}/tables`).then((j) => j.tables),
    createTable: (name, fields) => call(`meta/bases/${baseId}/tables`, { method: 'POST', body: { name, fields } }),
    createField: (tableId, field) => call(`meta/bases/${baseId}/tables/${tableId}/fields`, { method: 'POST', body: field }),
    /** All records of a table, following Airtable's 100-per-page offset. Returns plain field objects. */
    async listAll(table) {
      const out = [];
      let offset;
      do {
        const q = new URLSearchParams({ pageSize: '100' });
        if (offset) q.set('offset', offset);
        const j = await call(`${baseId}/${encodeURIComponent(table)}?${q}`);
        for (const r of j.records) out.push(r.fields);
        offset = j.offset;
      } while (offset);
      return out;
    },
    /** Upsert in batches of 10 (Airtable's max), merging on the primary key. */
    async upsert(table, key, rows) {
      for (let i = 0; i < rows.length; i += 10) {
        await call(`${baseId}/${encodeURIComponent(table)}`, {
          method: 'PATCH',
          body: { performUpsert: { fieldsToMergeOn: [key] }, typecast: true, records: rows.slice(i, i + 10).map((fields) => ({ fields })) },
        });
        await sleep(220);
      }
    },
  };
}
