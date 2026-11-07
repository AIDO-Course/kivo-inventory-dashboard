// Node tests, no dependencies:  node tests/run-tests.mjs
// Each test maps to a "Done means" line in SPEC.md §11.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const m = await import(pathToFileURL(join(root, 'js/metrics.js')).href);
const t = await import(pathToFileURL(join(root, 'js/tables.js')).href);
const c = await import(pathToFileURL(join(root, 'js/chart.js')).href);
const fmt = await import(pathToFileURL(join(root, 'js/format.js')).href);

const dataPath = join(root, 'data/mock-data.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));
const TODAY = m.today(data);

let pass = 0;
let fail = 0;
function test(name, fn) {
  try {
    fn();
    pass++;
    console.log(`PASS  ${name}`);
  } catch (e) {
    fail++;
    console.log(`FAIL  ${name}\n      ${e.message}`);
  }
}
function eq(a, b, msg = '') { if (a !== b) throw new Error(`${msg} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function ok(v, msg) { if (!v) throw new Error(msg); }

// ---------- M1: KPI formulas, computed independently ----------
test('M1 snapshot targets: Out = 9, Low = 31, In transit = 58, Late = 14 (All warehouses)', () => {
  const k = m.kpis(data, m.ALL);
  eq(k.out, 9, 'out');
  eq(k.low, 31, 'low');
  eq(k.inTransit, 58, 'in transit');
  eq(k.late, 14, 'late');
});

test('M1 SKUs = distinct SKUs (642), stock value = Σ qty × unit_cost, in $4.5M–$5.2M', () => {
  const k = m.kpis(data, m.ALL);
  eq(k.skus, 642);
  const cost = Object.fromEntries(data.products.map((p) => [p.sku, p.unit_cost]));
  const v = data.stock.reduce((s, r) => s + r.qty_on_hand * cost[r.sku], 0);
  ok(Math.abs(v - k.stockValue) < 0.01, 'stock value mismatch');
  ok(v >= 4.5e6 && v <= 5.2e6, `stock value ${v} outside range`);
});

test('M1 on-time % (last 30 days) between 88% and 94%, matches independent count', () => {
  const from = m.addDays(TODAY, -30);
  const d = data.shipments.filter((s) => s.status === 'delivered' && s.delivered_at > from && s.delivered_at <= TODAY);
  const pct = (d.filter((s) => s.delivered_at <= s.eta).length / d.length) * 100;
  ok(Math.abs(pct - m.onTimePct(data)) < 1e-9, 'mismatch');
  ok(pct >= 88 && pct <= 94, `on-time ${pct}`);
});

test('M1 late = open shipments with eta < today; late is derived, never stored', () => {
  const late = data.shipments.filter((s) => (s.status === 'scheduled' || s.status === 'in_transit') && s.eta < TODAY);
  eq(late.length, m.lateCount(data));
  ok(data.shipments.every((s) => ['scheduled', 'in_transit', 'delivered'].includes(s.status)), 'unexpected stored status');
});

// ---------- M2: per-warehouse ----------
test('M2 warehouse KPIs only include that warehouse', () => {
  for (const w of data.warehouses) {
    const k = m.kpis(data, w.id);
    eq(k.skus, data.stock.filter((r) => r.warehouse === w.id).length, `${w.id} skus`);
    eq(k.out, data.stock.filter((r) => r.warehouse === w.id && r.qty_on_hand === 0).length, `${w.id} out`);
  }
  const sum = ['CMH', 'RNO', 'ATL'].reduce((s, w) => s + m.stockValue(data, w), 0);
  ok(Math.abs(sum - m.stockValue(data)) < 0.01, 'warehouse values do not add up');
});

// ---------- M3: alerts ----------
test('M3 alert count = Low + Out, Out rows listed before Low rows', () => {
  const a = m.lowStockAlerts(data);
  eq(a.length, 40);
  const firstLow = a.findIndex((r) => r.qty_on_hand > 0);
  ok(a.slice(firstLow).every((r) => r.qty_on_hand > 0), 'Out after Low');
});

test('M3 "See all" filter (Low + Out) count equals panel count', () => {
  const rows = t.filterInventory(t.inventoryRows(data), { q: '', category: '', warehouse: '', status: 'lowout' }, m.ALL);
  eq(rows.length, m.lowStockAlerts(data).length);
});

// ---------- M4: inventory table ----------
const inv = t.inventoryRows(data);
const base = { q: '', category: '', warehouse: '', status: '' };
test('M4 search "0412" shows only rows whose SKU or name contains it', () => {
  const rows = t.filterInventory(inv, { ...base, q: '0412' }, m.ALL);
  ok(rows.length > 0, 'no rows');
  ok(rows.every((r) => r.sku.toLowerCase().includes('0412') || r.name.toLowerCase().includes('0412')), 'bad match');
});
test('M4 status Out shows only qty = 0', () => {
  const rows = t.filterInventory(inv, { ...base, status: 'out' }, m.ALL);
  eq(rows.length, 9);
  ok(rows.every((r) => r.qty === 0), 'non-zero row');
});
test('M4 sort by Qty asc then desc', () => {
  const asc = t.sortInventory(inv, { key: 'qty', dir: 'asc' });
  const desc = t.sortInventory(inv, { key: 'qty', dir: 'desc' });
  ok(asc.every((r, i) => i === 0 || asc[i - 1].qty <= r.qty), 'asc');
  ok(desc.every((r, i) => i === 0 || desc[i - 1].qty >= r.qty), 'desc');
});
test('M4 25 rows per page; page count = ceil(filtered / 25)', () => {
  eq(t.PAGE_SIZE, 25);
  eq(t.pageCount(1410), Math.ceil(1410 / 25));
  eq(t.pageCount(31), 2);
});
test('M4 default sort: Out → Low → In stock', () => {
  const s = t.sortInventory(inv, null);
  const rank = { out: 0, low: 1, in: 2 };
  ok(s.every((r, i) => i === 0 || rank[s[i - 1].status] <= rank[r.status]), 'order');
});

// ---------- M5: shipments ----------
const sh = t.shipmentRows(data);
test('M5 default: all late before non-late; days late = today − eta', () => {
  const s = t.sortShipments(sh, null);
  const lastLate = s.map((r) => r.status).lastIndexOf('late');
  ok(s.slice(0, lastLate + 1).every((r) => r.status === 'late'), 'late not first');
  for (const r of s.filter((x) => x.status === 'late')) eq(r.daysLate, m.dayDiff(TODAY, r.eta), r.id);
});
test('M5 direction Inbound shows only inbound', () => {
  const rows = t.filterShipments(sh, { direction: 'inbound', status: '' }, m.ALL);
  ok(rows.length > 0 && rows.every((r) => r.direction === 'inbound'), 'bad rows');
});

// ---------- M6: chart ----------
test('M6 by-category bars: 5 bars summing to stock value (±$1)', () => {
  const rows = c.chartRows(data, m.ALL, 'category');
  eq(rows.length, 5);
  ok(Math.abs(rows.reduce((s, r) => s + r.value, 0) - m.stockValue(data)) <= 1, 'sum');
});
test('M6 text summary names the largest group', () => {
  const rows = c.chartRows(data, m.ALL, 'category');
  const top = rows.reduce((a, b) => (b.value > a.value ? b : a));
  ok(c.summaryText(rows).startsWith(top.name), c.summaryText(rows));
});

// ---------- Mock data ----------
test('Data: generator is deterministic (byte-identical output)', () => {
  const before = createHash('sha256').update(readFileSync(dataPath)).digest('hex');
  execFileSync(process.execPath, [join(root, 'scripts/generate-data.js')], { stdio: 'ignore' });
  const after = createHash('sha256').update(readFileSync(dataPath)).digest('hex');
  eq(after, before);
});
test('Data: 642 products, 1,410 stock rows, 26,000 ± 2% shipments, 555 history rows', () => {
  eq(data.products.length, 642);
  eq(data.stock.length, 1410);
  ok(Math.abs(data.shipments.length - 26000) <= 520, `shipments ${data.shipments.length}`);
  eq(data.stock_history.length, 555);
});
test('Data: shipments cover 2023-11-01 … 2026-11-07 and no Sunday ship dates', () => {
  const dates = data.shipments.map((s) => s.ship_date).sort();
  eq(dates[0], '2023-11-01');
  ok(dates.includes('2026-11-06') || dates.includes('2026-11-07'), 'no recent shipments');
  ok(data.shipments.every((s) => new Date(s.ship_date + 'T00:00:00Z').getUTCDay() !== 0), 'Sunday shipment');
});
test('Data: 4 carriers, 18 suppliers, 60 destination cities', () => {
  eq(new Set(data.shipments.map((s) => s.carrier)).size, 4);
  eq(new Set(data.products.map((p) => p.supplier)).size, 18);
  eq(new Set(data.shipments.filter((s) => s.direction === 'outbound').map((s) => s.destination)).size, 60);
});
test('Data: every shipment line SKU exists; outbound origin stocks it', () => {
  const skus = new Set(data.products.map((p) => p.sku));
  const carried = new Set(data.stock.map((r) => `${r.warehouse}|${r.sku}`));
  for (const s of data.shipments) {
    for (const l of s.lines) {
      ok(skus.has(l.sku), `${s.id} unknown sku ${l.sku}`);
      if (s.direction === 'outbound') ok(carried.has(`${s.origin}|${l.sku}`), `${s.id} origin lacks ${l.sku}`);
    }
  }
});
test('Data: no real brand names (whole word)', () => {
  const text = readFileSync(dataPath, 'utf8');
  const brands = ['HP', 'Canon', 'Epson', 'Brother', 'Dell', 'Lenovo', 'Logitech', 'Apple', 'Samsung', 'Staples', 'FedEx', 'UPS', 'USPS', 'DHL', 'Microsoft', 'Cisco', 'Netgear', 'Xerox', 'Avery', 'Sharpie', 'Post-it', 'Herman Miller', 'Steelcase', 'IKEA'];
  for (const b of brands) ok(!new RegExp(`\\b${b}\\b`, 'i').test(text), `found brand ${b}`);
});

// ---------- Global checklist: files ----------
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (['.git', 'node_modules', '.claude', 'data'].includes(f)) continue;
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const sourceFiles = walk(root).filter((p) => ['.css', '.js', '.html', '.svg'].includes(extname(p)) && !p.includes(`${join('tests', '')}`));

test('Global: only the 17 palette colours (+ ink-900 rgba shadows) in CSS, SVG, HTML and JS', () => {
  const palette = new Set(['#0B5563', '#08414C', '#E7F0F2', '#F2A541', '#8A5A12', '#FDF1DE', '#4A4FC4', '#24693F', '#E6F2EA', '#B42318', '#8F1D13', '#FDECEA', '#14262B', '#4A5F66', '#D5E0E3', '#F4F7F8', '#FFFFFF']);
  const named = /\b(?:red|blue|green|black|white|gray|grey|orange|yellow|purple|pink|brown|navy|teal|silver|gold)\b\s*[;!)]/i;
  for (const file of sourceFiles) {
    const txt = readFileSync(file, 'utf8');
    for (const hex of txt.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![0-9a-fA-F])/g) || []) {
      if (/^#i-/.test(hex)) continue;
      ok(palette.has(hex.toUpperCase()), `${file}: ${hex}`);
    }
    for (const rgb of txt.match(/rgba?\([^)]*\)|hsla?\([^)]*\)/g) || []) {
      ok(/^rgba\(20,\s*38,\s*43,/.test(rgb), `${file}: ${rgb}`);
    }
    if (extname(file) === '.css') ok(!named.test(txt.replace(/var\(--[a-z0-9-]+\)/g, '').replace(/--[a-z0-9-]+:/g, '')), `${file}: named colour`);
  }
});
test('Global: red tokens used only for out / late / error (CSS)', () => {
  const css = readFileSync(join(root, 'css/styles.css'), 'utf8');
  const lines = css.split('\n').filter((l) => /var\(--red-(700|800|50)\)/.test(l));
  for (const l of lines) ok(/out|late|error|eta-late|btn--danger/.test(l), `red used in: ${l.trim()}`);
});
test('Global: no frameworks (React, Angular, Vue, Svelte, jQuery, Bootstrap, Tailwind), no package.json build', () => {
  for (const file of sourceFiles) {
    const txt = readFileSync(file, 'utf8');
    ok(!/react|angular|vue(\.js)?['"/]|svelte|jquery|bootstrap|tailwind/i.test(txt), `${file} references a framework`);
  }
  ok(!readdirSync(root).includes('package.json'), 'package.json present');
});
test('Global: nothing from IT IS NOT in the UI (login, edit, order/reorder, email, dark mode, CSV)', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8') + readdirSync(join(root, 'js')).map((f) => readFileSync(join(root, 'js', f), 'utf8')).join('');
  for (const w of ['login', 'sign in', 'password', 'Reorder now', 'Place order', 'mailto:', 'Export CSV', 'dark-mode', 'contenteditable']) {
    ok(!html.toLowerCase().includes(w.toLowerCase()), `found "${w}"`);
  }
  ok(!/prefers-color-scheme:\s*dark/.test(readFileSync(join(root, 'css/styles.css'), 'utf8')), 'dark mode CSS');
});
test('Global: header logo is assets/logo.svg at 40 px height, Inter loaded', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  ok(/<img src="assets\/logo\.svg"[^>]*height="40"/.test(html), 'logo');
  ok(html.includes('family=Inter'), 'Inter');
  ok(/\.brand img \{ block-size: 40px/.test(readFileSync(join(root, 'css/styles.css'), 'utf8')), 'logo css height');
});
test('M8: data-as-of text formats to "Nov 7, 2026, 8:00 AM ET"', () => {
  eq(fmt.asOf(data.meta.generated_at), 'Nov 7, 2026, 8:00 AM ET');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
