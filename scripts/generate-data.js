#!/usr/bin/env node
// Kivo mock data generator. Node >= 18, no dependencies.
// Same seed => byte-identical data/mock-data.json. See SPEC.md §7.4.
const { writeFileSync, mkdirSync } = require('node:fs');
const { dirname, join } = require('node:path');

const SEED = 20261107;
const TODAY = '2026-11-07';
const START = '2023-11-01';
const LAST_SCHEDULED = '2026-11-28';
const TARGET_SHIPMENTS = 26000;
const TARGET_VALUE = 4_850_000;

// ---------- PRNG (mulberry32) ----------
let s = SEED >>> 0;
function rand() {
  s = (s + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const int = (a, b) => a + Math.floor(rand() * (b - a + 1));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const chance = (p) => rand() < p;
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const round2 = (n) => Math.round(n * 100) / 100;

// ---------- Dates (UTC, date-only) ----------
const toDate = (iso) => new Date(iso + 'T00:00:00Z');
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (isoStr, n) => { const d = toDate(isoStr); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const dayDiff = (a, b) => Math.round((toDate(a) - toDate(b)) / 86400000);

// ---------- Reference data (all invented) ----------
const warehouses = [
  { id: 'CMH', name: 'Columbus OH', timezone: 'America/New_York' },
  { id: 'RNO', name: 'Reno NV', timezone: 'America/Los_Angeles' },
  { id: 'ATL', name: 'Atlanta GA', timezone: 'America/New_York' },
];

const suppliers = [
  'Northgate Office Supply Co.', 'Millbrook Paper Mills', 'Cobalt Peripherals Inc.', 'Brightline Imaging Supply',
  'Harlow Cable Works', 'Oakridge Furniture Group', 'Tessera Paper Products', 'Pinecrest Stationery',
  'Vantage Input Devices', 'Lumen Display Supply', 'Copperfield Networking', 'Granite Office Seating',
  'Westbay Toner Recyclers', 'Silverleaf Desk Systems', 'Redwood Writing Goods', 'Quarry Lane Electronics',
  'Fairmont Filing Supply', 'Clearwater Connectivity',
];

const carriers = ['Ridgeway Freight', 'BlueLine Logistics', 'Summit Express', 'Harbor & Pine Transport'];
const carrierLate = { 'Ridgeway Freight': 0.07, 'BlueLine Logistics': 0.065, 'Summit Express': 0.06, 'Harbor & Pine Transport': 0.15 };

const cities = [
  'Dayton, OH', 'Cleveland, OH', 'Cincinnati, OH', 'Toledo, OH', 'Akron, OH', 'Indianapolis, IN', 'Fort Wayne, IN',
  'Louisville, KY', 'Lexington, KY', 'Pittsburgh, PA', 'Philadelphia, PA', 'Detroit, MI', 'Grand Rapids, MI',
  'Chicago, IL', 'Springfield, IL', 'Milwaukee, WI', 'Madison, WI', 'Minneapolis, MN', 'St. Louis, MO',
  'Kansas City, MO', 'Omaha, NE', 'Des Moines, IA', 'Nashville, TN', 'Memphis, TN', 'Knoxville, TN',
  'Birmingham, AL', 'Montgomery, AL', 'Jacksonville, FL', 'Orlando, FL', 'Tampa, FL', 'Miami, FL',
  'Savannah, GA', 'Augusta, GA', 'Macon, GA', 'Charlotte, NC', 'Raleigh, NC', 'Greensboro, NC',
  'Columbia, SC', 'Charleston, SC', 'Richmond, VA', 'Norfolk, VA', 'Baltimore, MD', 'Sacramento, CA',
  'Fresno, CA', 'Oakland, CA', 'San Jose, CA', 'Los Angeles, CA', 'San Diego, CA', 'Portland, OR',
  'Eugene, OR', 'Seattle, WA', 'Spokane, WA', 'Boise, ID', 'Salt Lake City, UT', 'Las Vegas, NV',
  'Phoenix, AZ', 'Tucson, AZ', 'Denver, CO', 'Albuquerque, NM', 'Sparks, NV',
];
const cityRegion = (c) => {
  const st = c.slice(-2);
  if (['CA', 'OR', 'WA', 'ID', 'UT', 'NV', 'AZ', 'CO', 'NM'].includes(st)) return 'RNO';
  if (['FL', 'GA', 'AL', 'TN', 'NC', 'SC'].includes(st)) return 'ATL';
  return 'CMH';
};

const categories = [
  {
    name: 'Paper & Stationery', prefix: 'PAP', count: 160, cost: [2, 60], qty: [60, 1200], rop: [20, 160],
    supplierIdx: [1, 6, 7, 14, 16],
    types: ['Copy paper', 'Cardstock', 'Legal pad', 'Spiral notebook', 'Sticky notes', 'Ballpoint pens', 'Gel pens',
      'Highlighters', 'File folders', 'Hanging folders', 'Envelopes', 'Shipping labels', 'Binder', 'Index cards',
      'Sheet protectors', 'Desk calendar', 'Whiteboard markers', 'Mechanical pencils', 'Packing tape', 'Paper clips'],
    variants: ['letter, 20 lb, case of 10 reams', 'letter, 24 lb, case of 5 reams', 'pack of 12', 'pack of 24',
      'box of 100', 'box of 500', 'assorted colors', 'blue ink, pack of 12', 'black ink, pack of 36',
      'recycled, case of 8', 'legal size, pack of 25', '3 in, white'],
  },
  {
    name: 'Printer Supplies', prefix: 'PRN', count: 128, cost: [8, 180], qty: [10, 360], rop: [6, 40],
    supplierIdx: [0, 3, 12],
    types: ['Toner cartridge', 'Ink cartridge', 'Drum unit', 'Fuser kit', 'Label tape', 'Thermal paper roll',
      'Photo paper', 'Maintenance kit', 'Ribbon cassette', 'Waste toner box', 'Ink bottle', 'Transfer belt'],
    variants: ['K-12, black', 'K-26, black', 'K-35, cyan', 'K-35, magenta', 'K-35, yellow', 'T-80, black, high yield',
      'T-80, color, 3-pack', 'M-410, standard', 'M-410, extended', '12 mm, white', '24 mm, clear', 'glossy, 100 sheets'],
  },
  {
    name: 'Computer Peripherals', prefix: 'PER', count: 150, cost: [6, 320], qty: [8, 240], rop: [4, 30],
    supplierIdx: [2, 8, 9, 15],
    types: ['Wireless mouse', 'Wired mouse', 'Keyboard', 'Wireless keyboard and mouse set', 'USB-C hub', 'Docking station',
      'Webcam', 'Headset', 'Monitor 24 in', 'Monitor 27 in', 'Monitor arm', 'External SSD', 'USB flash drive',
      'Laptop stand', 'Speaker pair'],
    variants: ['standard', 'ergonomic', 'compact', '7-port, aluminum', '4-port', '1080p', 'noise-cancelling', '256 GB',
      '1 TB', '64 GB', 'dual-display', 'black', 'silver'],
  },
  {
    name: 'Cables & Networking', prefix: 'CBL', count: 120, cost: [3, 90], qty: [20, 600], rop: [10, 80],
    supplierIdx: [4, 10, 17],
    types: ['HDMI cable', 'USB-C cable', 'Ethernet cable Cat6', 'DisplayPort cable', 'Power strip', 'Surge protector',
      'Network switch', 'Wi-Fi access point', 'Cable ties', 'Extension cord', 'USB-A to USB-C adapter', 'Patch panel'],
    variants: ['3 ft', '6 ft', '10 ft', '25 ft', '8-port', '16-port', '6-outlet', '12-outlet', 'pack of 100', 'white', 'black'],
  },
  {
    name: 'Office Furniture', prefix: 'FUR', count: 84, cost: [45, 680], qty: [0, 60], rop: [4, 15],
    supplierIdx: [5, 11, 13],
    types: ['Task chair', 'Executive chair', 'Standing desk', 'Writing desk', 'Filing cabinet', 'Bookcase',
      'Conference table', 'Guest chair', 'Mobile pedestal', 'Desk lamp', 'Whiteboard', 'Storage cabinet'],
    variants: ['mesh, black', 'fabric, gray', '48 in, walnut', '60 in, white', '2-drawer', '4-drawer', '5-shelf',
      'stackable, set of 2', 'lockable', 'LED', '4 x 6 ft', '36 in'],
  },
];

// ---------- Products ----------
const products = [];
for (const cat of categories) {
  const combos = [];
  for (const t of cat.types) for (const v of cat.variants) combos.push(`${t}, ${v}`);
  const names = shuffle(combos).slice(0, cat.count);
  const nums = shuffle(Array.from({ length: 900 }, (_, i) => i + 1)).slice(0, cat.count).sort((a, b) => a - b);
  // PRN-0412 is the SKU used in SPEC.md examples and tests; make sure it exists.
  if (cat.prefix === 'PRN' && !nums.includes(412)) { nums[0] = 412; nums.sort((a, b) => a - b); }
  names.forEach((name, i) => {
    const [lo, hi] = cat.cost;
    const unit_cost = round2(lo + (hi - lo) * Math.pow(rand(), 1.6));
    products.push({
      sku: `${cat.prefix}-${String(nums[i]).padStart(4, '0')}`,
      name,
      category: cat.name,
      unit_cost,
      supplier: suppliers[pick(cat.supplierIdx)],
      lead_time_days: int(5, 30),
    });
  });
}
const catOf = Object.fromEntries(categories.map((c) => [c.name, c]));
const productBySku = Object.fromEntries(products.map((p) => [p.sku, p]));

// ---------- Stock ----------
const stock = [];
const carry = { CMH: products.map((p) => p.sku), RNO: shuffle(products.map((p) => p.sku)).slice(0, 430), ATL: shuffle(products.map((p) => p.sku)).slice(0, 338) };
for (const w of ['CMH', 'RNO', 'ATL']) {
  for (const sku of carry[w].slice().sort()) {
    const c = catOf[productBySku[sku].category];
    const reorder_point = int(c.rop[0], c.rop[1]);
    stock.push({ sku, warehouse: w, qty_on_hand: 0, reorder_point, _base: int(c.qty[0], c.qty[1]) });
  }
}
// Pick exactly 9 Out and 31 Low rows; everything else is In stock.
const order = shuffle(stock.map((_, i) => i));
const outIdx = new Set(order.slice(0, 9));
const lowIdx = new Set(order.slice(9, 40));
const valueOf = (rows) => rows.reduce((t, r) => t + r.qty_on_hand * productBySku[r.sku].unit_cost, 0);
stock.forEach((r, i) => {
  if (outIdx.has(i)) r.qty_on_hand = 0;
  else if (lowIdx.has(i)) r.qty_on_hand = int(1, r.reorder_point);
});
// Scale in-stock quantities so total stock value lands on the target.
const inStock = stock.filter((_, i) => !outIdx.has(i) && !lowIdx.has(i));
const fixedValue = valueOf(stock.filter((_, i) => outIdx.has(i) || lowIdx.has(i)));
let factor = 1;
for (let iter = 0; iter < 30; iter++) {
  inStock.forEach((r) => { r.qty_on_hand = Math.max(r.reorder_point + 1, Math.round(r._base * factor)); });
  const v = valueOf(inStock) + fixedValue;
  factor *= TARGET_VALUE / v;
}
stock.forEach((r) => delete r._base);

// ---------- Stock history (monthly snapshots on the 7th) ----------
const groups = {};
for (const r of stock) {
  const k = `${r.warehouse}|${productBySku[r.sku].category}`;
  groups[k] = (groups[k] || 0) + r.qty_on_hand * productBySku[r.sku].unit_cost;
}
const stock_history = [];
const months = [];
for (let i = 36; i >= 0; i--) {
  const d = toDate('2026-11-07');
  d.setUTCMonth(d.getUTCMonth() - i);
  months.push(iso(d));
}
for (const w of ['CMH', 'RNO', 'ATL']) {
  for (const c of categories) {
    const current = groups[`${w}|${c.name}`] || 0;
    for (const m of months) {
      const monthsBack = Math.round(dayDiff('2026-11-07', m) / 30.44);
      let v;
      if (monthsBack === 0) v = current;
      else {
        const growth = Math.pow(1.06, -monthsBack / 12);
        const mon = toDate(m).getUTCMonth();
        const seasonal = mon === 0 ? 0.92 : mon === 1 ? 0.95 : mon === 6 ? 1.04 : mon === 7 ? 0.97 : 1;
        v = current * growth * seasonal * (0.97 + rand() * 0.04);
      }
      stock_history.push({ date: m, warehouse: w, category: c.name, value: round2(v) });
    }
  }
}

// ---------- Shipments ----------
function dayWeight(d) {
  const dt = toDate(d);
  const dow = dt.getUTCDay();
  if (dow === 0) return 0;
  let w = dow === 6 ? 0.03 : 1;
  const years = dayDiff(d, START) / 365.25;
  w *= Math.pow(1.08, years);
  const mon = dt.getUTCMonth();
  const day = dt.getUTCDate();
  if (mon === 6 || mon === 7) w *= 1.35;
  if (mon === 10 || mon === 11) w *= 1.2;
  if (mon === 11 && day >= 24) w *= 0.5;
  if (mon === 0 && day <= 1) w *= 0.5;
  if (mon === 6 && day >= 1 && day <= 7) w *= 0.8;
  return w;
}
const days = [];
for (let d = START; d <= LAST_SCHEDULED; d = addDays(d, 1)) days.push(d);
const totalWeight = days.reduce((t, d) => t + dayWeight(d), 0);
const perWeight = TARGET_SHIPMENTS / totalWeight;

const stockByWh = { CMH: [], RNO: [], ATL: [] };
for (const r of stock) stockByWh[r.warehouse].push(r.sku);

function lineQty(sku, inbound) {
  const c = catOf[productBySku[sku].category].prefix;
  const base = { PAP: [10, 120], PRN: [4, 40], PER: [2, 30], CBL: [5, 80], FUR: [1, 8] }[c];
  const q = int(base[0], base[1]);
  return inbound ? q * int(3, 6) : q;
}

const shipments = [];
let seq = 20000;
let carry2 = 0;
for (const d of days) {
  const expected = dayWeight(d) * perWeight + carry2;
  const n = Math.floor(expected);
  carry2 = expected - n;
  for (let k = 0; k < n; k++) {
    const inbound = chance(0.3);
    const carrier = pick(carriers);
    let wh, origin, destination, skus;
    if (inbound) {
      wh = chance(0.45) ? 'CMH' : chance(0.55) ? 'RNO' : 'ATL';
      const first = pick(stockByWh[wh]);
      const sup = productBySku[first].supplier;
      const same = stockByWh[wh].filter((x) => productBySku[x].supplier === sup);
      const nLines = Math.min(same.length, 1 + Math.floor(Math.pow(rand(), 2) * 6));
      skus = [first, ...shuffle(same.filter((x) => x !== first)).slice(0, nLines - 1)];
      origin = sup;
      destination = wh;
    } else {
      destination = pick(cities);
      wh = chance(0.75) ? cityRegion(destination) : pick(['CMH', 'RNO', 'ATL']);
      const nLines = 1 + Math.floor(Math.pow(rand(), 2.2) * 4);
      skus = shuffle(stockByWh[wh]).slice(0, nLines);
      origin = wh;
    }
    const transit = inbound ? 3 + Math.floor(Math.pow(rand(), 1.8) * 12) : 1 + Math.floor(Math.pow(rand(), 1.8) * 5);
    const eta = addDays(d, transit);
    const mon = toDate(d).getUTCMonth();
    let pLate = carrierLate[carrier];
    if (mon === 11 || mon === 0) pLate += 0.06;
    let delay = 0;
    if (chance(pLate)) delay = chance(0.04) ? int(10, 16) : int(1, 4);
    const actual = addDays(eta, delay);
    shipments.push({
      id: `SH-${seq++}`,
      direction: inbound ? 'inbound' : 'outbound',
      origin, destination,
      status: 'delivered',
      ship_date: d,
      eta,
      delivered_at: actual,
      carrier,
      lines: skus.map((sku) => ({ sku, qty: lineQty(sku, inbound) })),
    });
  }
}

// Snapshot state on TODAY.
for (const sh of shipments) {
  if (sh.ship_date > TODAY) { sh.status = 'scheduled'; sh.delivered_at = null; }
  else if (sh.delivered_at > TODAY) sh.delivered_at = TODAY < sh.eta ? null : TODAY;
}
// Anything not yet deliverable by today is delivered "today" unless chosen as in transit below.
for (const sh of shipments) if (sh.status === 'delivered' && sh.delivered_at === null) sh.delivered_at = TODAY;

const recent = shuffle(shipments.filter((sh) => sh.ship_date >= addDays(TODAY, -4) && sh.ship_date <= TODAY));
for (const sh of recent.slice(0, 44)) {
  sh.status = 'in_transit';
  sh.delivered_at = null;
  if (sh.eta < TODAY) sh.eta = addDays(TODAY, int(0, 3));
}
const olderPool = shuffle(shipments.filter((sh) => sh.ship_date >= addDays(TODAY, -20) && sh.ship_date <= addDays(TODAY, -5) && sh.status === 'delivered'));
for (const sh of olderPool.slice(0, 14)) {
  sh.status = 'in_transit';
  sh.delivered_at = null;
  const maxEta = addDays(TODAY, -1);
  const minEta = addDays(sh.ship_date, 1);
  const span = Math.max(0, dayDiff(maxEta, minEta));
  sh.eta = addDays(minEta, int(0, span));
}
// Outlier: one 2025 inbound delivered 23 days late.
const outlier = shipments.find((sh) => sh.direction === 'inbound' && sh.ship_date >= '2025-03-03');
outlier.delivered_at = addDays(outlier.eta, 23);

const data = {
  meta: { generated_at: '2026-11-07T08:00:00-05:00', seed: SEED, currency: 'USD', locale: 'en-US' },
  warehouses,
  products,
  stock,
  stock_history,
  shipments,
};

const out = join(__dirname, '..', 'data', 'mock-data.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data));
console.log(`Wrote ${out}: ${products.length} products, ${stock.length} stock rows, ${shipments.length} shipments, ${stock_history.length} history rows.`);
