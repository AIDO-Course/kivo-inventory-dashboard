// Loads and validates the mock data set (SPEC §7).
const DEFAULT_URL = 'data/mock-data.json';

// Test seam: tests/tests.html opens the page with ?data=<file>.json to simulate a failed load.
function dataUrl() {
  const name = new URLSearchParams(location.search).get('data');
  return name && /^[\w-]+\.json$/.test(name) ? `data/${name}` : DEFAULT_URL;
}

export async function loadData() {
  const res = await fetch(dataUrl(), { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  validate(data);
  return data;
}

export function validate(data) {
  for (const key of ['meta', 'warehouses', 'products', 'stock', 'stock_history', 'shipments']) {
    if (!data || !(key in data)) throw new Error(`Mock data is missing "${key}"`);
  }
}
