#!/usr/bin/env node
// Local server: serves the dashboard and GET /api/data, which reads the Kivo base from Airtable.
// The Airtable token stays here, on the server, read from .env. It never reaches the browser.
// Usage: node server.mjs   (then open http://localhost:8765)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import { loadEnv, client, root } from './scripts/airtable.mjs';
import { TABLES, fromRecords } from './js/airtable-map.js';
import { WAREHOUSE_COORDS, toWarehouseWeather } from './js/weather.js';

const PORT = Number(process.env.PORT) || 8765;
const CACHE_MS = 60_000; // read Airtable at most once a minute: nobody needs fresher stock numbers
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};
// Never serve secrets or tooling over HTTP.
const BLOCKED = /(^|[\\/])(\.env|\.git|\.claude|node_modules|scripts|server\.mjs)/;

const at = client(loadEnv());
let cache = { at: 0, body: null };

// ---------- Warehouse weather: OpenWeatherMap (SPEC §7.6) ----------
// The key stays here, read from .env. Weather changes slowly, so read it at most every 30 minutes.
const WEATHER_CACHE_MS = 30 * 60_000;
let weatherCache = { at: 0, body: null };

async function apiWeather() {
  if (weatherCache.body && Date.now() - weatherCache.at < WEATHER_CACHE_MS) return weatherCache.body;
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) throw new Error('OPENWEATHER_API_KEY is not set in .env');
  const warehouses = await at.listAll('Warehouses');
  const out = [];
  for (const w of warehouses) {
    const c = WAREHOUSE_COORDS[w.id];
    if (!c) continue;
    const q = new URLSearchParams({ lat: c.lat, lon: c.lon, units: 'imperial', appid: key });
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${q}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`OpenWeatherMap ${res.status} ${json.message || ''}`.trim());
    out.push(toWarehouseWeather(w, json));
  }
  weatherCache = { at: Date.now(), body: JSON.stringify({ source: 'openweathermap', updated_at: new Date().toISOString(), warehouses: out }) };
  return weatherCache.body;
}

async function apiData() {
  if (cache.body && Date.now() - cache.at < CACHE_MS) return cache.body;
  const tables = {};
  for (const name of Object.keys(TABLES)) tables[name] = await at.listAll(name);
  cache = { at: Date.now(), body: JSON.stringify(fromRecords(tables)) };
  return cache.body;
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/api/data') {
      const body = await apiData();
      res.writeHead(200, { 'Content-Type': TYPES['.json'], 'Cache-Control': 'no-store' });
      return res.end(body);
    }
    if (url.pathname === '/api/weather') {
      try {
        const body = await apiWeather();
        res.writeHead(200, { 'Content-Type': TYPES['.json'], 'Cache-Control': 'no-store' });
        return res.end(body);
      } catch (e) {
        console.error(e.message);
        res.writeHead(502, { 'Content-Type': TYPES['.json'] });
        return res.end(JSON.stringify({ error: 'Could not read weather from OpenWeatherMap' }));
      }
    }
    const rel = normalize(decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)).replace(/^[\\/]+/, '');
    if (rel.startsWith('..') || BLOCKED.test(rel)) { res.writeHead(404); return res.end('Not found'); }
    const file = await readFile(join(root, rel));
    res.writeHead(200, { 'Content-Type': TYPES[extname(rel)] || 'application/octet-stream' });
    res.end(file);
  } catch (e) {
    if (e.code === 'ENOENT') { res.writeHead(404); return res.end('Not found'); }
    console.error(e.message);
    res.writeHead(502, { 'Content-Type': TYPES['.json'] });
    res.end(JSON.stringify({ error: 'Could not read data from Airtable' }));
  }
}).listen(PORT, () => console.log(`Kivo dashboard on http://localhost:${PORT} (data from Airtable base ${at.baseId})`));
