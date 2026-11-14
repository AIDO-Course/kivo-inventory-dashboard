// Loads and validates the data set (SPEC §7, §7.5).
// The only source is the Airtable database, read by the local server (server.mjs) at api/data.
// There is no static fallback: if Airtable can't be read, the page shows the error banner (§8).
const API_URL = 'api/data';

// Test seam: tests/tests.html opens the page with ?api=missing to simulate a failed load.
function apiUrl() {
  return new URLSearchParams(location.search).get('api') === 'missing' ? 'api/missing' : API_URL;
}

export async function loadData() {
  const res = await fetch(apiUrl(), { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  validate(data);
  return data;
}

export function validate(data) {
  for (const key of ['meta', 'warehouses', 'products', 'stock', 'stock_history', 'shipments']) {
    if (!data || !(key in data)) throw new Error(`Data is missing "${key}"`);
  }
}
