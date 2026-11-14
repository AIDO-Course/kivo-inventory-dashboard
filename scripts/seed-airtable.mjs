#!/usr/bin/env node
// One-time (and safe to re-run) upload of the mock data subset to Airtable. SPEC §7.5.
// Usage: node scripts/seed-airtable.mjs
// Creates any missing tables/fields, then upserts every record on its primary key,
// so running it twice gives exactly the same base (idempotent).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv, client, root } from './airtable.mjs';
import { TABLES, selectSubset, toRecords } from '../js/airtable-map.js';

const NUMBER_FIELDS = { unit_cost: 2, lead_time_days: 0, seed: 0 };
const LONG_TEXT = new Set(['lines', 'rows']);

function fieldDef(name) {
  if (name in NUMBER_FIELDS) return { name, type: 'number', options: { precision: NUMBER_FIELDS[name] } };
  if (/^(qty|reorder)_/.test(name)) return { name, type: 'number', options: { precision: 0 } };
  if (LONG_TEXT.has(name)) return { name, type: 'multilineText' };
  return { name, type: 'singleLineText' };
}

const at = client(loadEnv());
const data = JSON.parse(readFileSync(join(root, 'data/mock-data.json'), 'utf8'));
const records = toRecords(selectSubset(data));

// 1. Schema: create missing tables and fields.
const existing = await at.listTables();
for (const [name, fields] of Object.entries(TABLES)) {
  const table = existing.find((t) => t.name === name);
  if (!table) {
    await at.createTable(name, fields.map(fieldDef));
    console.log(`Created table ${name}`);
    continue;
  }
  if (table.fields[0].name !== fields[0]) {
    throw new Error(`Table ${name} exists but its primary field is "${table.fields[0].name}", expected "${fields[0]}". Rename or delete it.`);
  }
  for (const f of fields) {
    if (!table.fields.some((x) => x.name === f)) {
      await at.createField(table.id, fieldDef(f));
      console.log(`Added field ${name}.${f}`);
    }
  }
}

// 2. Records: upsert on the primary key. Count in, count out.
let total = 0;
for (const [name, fields] of Object.entries(TABLES)) {
  const rows = records[name];
  await at.upsert(name, fields[0], rows);
  const back = await at.listAll(name);
  total += back.length;
  const status = back.length === rows.length ? 'OK' : 'MISMATCH';
  console.log(`${name.padEnd(13)} sent ${String(rows.length).padStart(4)}  in Airtable ${String(back.length).padStart(4)}  ${status}`);
  if (status !== 'OK') process.exitCode = 1;
}
console.log(`Total records in base: ${total}`);
