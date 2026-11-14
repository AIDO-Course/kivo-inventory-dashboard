#!/usr/bin/env node
// One-time (and safe to re-run) upload of the generated data subset to Airtable. SPEC §7.5.
// Usage: node scripts/seed-airtable.mjs
// Creates any missing tables/fields, upserts every record on its primary key and deletes records
// that are no longer in the data set, so running it twice gives exactly the same base (idempotent).
import { execFileSync } from 'node:child_process';
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
const data = JSON.parse(execFileSync(process.execPath, [join(root, 'scripts/generate-data.js')], { maxBuffer: 64 << 20 }));
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

// 2. Records: upsert on the primary key, delete the rest. Count in, count out.
let total = 0;
for (const [name, fields] of Object.entries(TABLES)) {
  const rows = records[name];
  await at.upsert(name, fields[0], rows);
  const removed = await at.deleteMissing(name, fields[0], new Set(rows.map((r) => r[fields[0]])));
  if (removed) console.log(`${name}: deleted ${removed} records no longer in the data set`);
  const back = await at.listAll(name);
  total += back.length;
  const status = back.length === rows.length ? 'OK' : 'MISMATCH';
  console.log(`${name.padEnd(13)} sent ${String(rows.length).padStart(4)}  in Airtable ${String(back.length).padStart(4)}  ${status}`);
  if (status !== 'OK') process.exitCode = 1;
}
console.log(`Total records in base: ${total}`);
