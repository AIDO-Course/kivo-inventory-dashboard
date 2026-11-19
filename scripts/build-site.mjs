#!/usr/bin/env node
// Builds the static site for GitHub Pages into _site/.
// Pages can't run server.mjs, so this script does the server's job ahead of time:
// it reads Airtable and OpenWeatherMap and writes the answers to _site/api/data and _site/api/weather,
// the same paths the page already fetches. The keys come from GitHub Actions secrets (env vars)
// or from .env locally. Only data is written: no key ever lands in _site/.
// Usage: node scripts/build-site.mjs
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadEnv, client, root } from './airtable.mjs';
import { TABLES, fromRecords } from '../js/airtable-map.js';
import { WAREHOUSE_COORDS, toWarehouseWeather } from '../js/weather.js';

const out = join(root, '_site');
const PUBLIC = ['index.html', 'css', 'js', 'assets', 'tests'];

const at = client(loadEnv());

async function buildData() {
  const tables = {};
  for (const name of Object.keys(TABLES)) tables[name] = await at.listAll(name);
  return { data: fromRecords(tables), warehouses: tables.Warehouses };
}

async function buildWeather(warehouses) {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) throw new Error('OPENWEATHER_API_KEY is not set');
  const rows = [];
  for (const w of warehouses) {
    const c = WAREHOUSE_COORDS[w.id];
    if (!c) continue;
    const q = new URLSearchParams({ lat: c.lat, lon: c.lon, units: 'imperial', appid: key });
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${q}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`OpenWeatherMap ${res.status} ${json.message || ''}`.trim());
    rows.push(toWarehouseWeather(w, json));
  }
  return { source: 'openweathermap', updated_at: new Date().toISOString(), warehouses: rows };
}

await rm(out, { recursive: true, force: true });
await mkdir(join(out, 'api'), { recursive: true });
for (const p of PUBLIC) await cp(join(root, p), join(out, p), { recursive: true });
await writeFile(join(out, '.nojekyll'), '');

const { data, warehouses } = await buildData();
await writeFile(join(out, 'api', 'data'), JSON.stringify(data));
console.log(`api/data: ${data.products.length} products, ${data.shipments.length} shipments from Airtable base ${at.baseId}`);

// Weather is optional, like on the server: if it fails, the panel says "Weather unavailable"
// and the rest of the dashboard still deploys.
try {
  const weather = await buildWeather(warehouses);
  await writeFile(join(out, 'api', 'weather'), JSON.stringify(weather));
  console.log(`api/weather: ${weather.warehouses.length} warehouses from OpenWeatherMap`);
} catch (e) {
  console.warn(`::warning::Weather skipped: ${e.message}`);
}

console.log(`Built ${out}`);
