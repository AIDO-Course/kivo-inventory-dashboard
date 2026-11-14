// Loads and validates the data set (SPEC §7, §7.5).
// First choice: the Airtable database, through the local server's api/data.
// Fallback: the static mock file (e.g. on GitHub Pages, where there is no server).
const API_URL = 'api/data';
const DEFAULT_URL = 'data/mock-data.json';

// Test seam: tests/tests.html opens the page with ?data=<file>.json to simulate a failed load.
function testDataName() {
  const name = new URLSearchParams(location.search).get('data');
  return name && /^[\w-]+\.json$/.test(name) ? name : null;
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  validate(data);
  return data;
}

export async function loadData() {
  const testName = testDataName();
  if (testName) return fetchJson(`data/${testName}`);
  try {
    const data = await fetchJson(API_URL);
    data.meta.source = 'airtable';
    return data;
  } catch (err) {
    console.info('Airtable API not available, using mock data:', err.message);
  }
  const data = await fetchJson(DEFAULT_URL);
  data.meta.source = 'mock';
  return data;
}

export function validate(data) {
  for (const key of ['meta', 'warehouses', 'products', 'stock', 'stock_history', 'shipments']) {
    if (!data || !(key in data)) throw new Error(`Mock data is missing "${key}"`);
  }
}
