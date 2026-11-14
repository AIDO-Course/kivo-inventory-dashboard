// Maps the dashboard data set to Airtable records and back (SPEC §7.5).
// Pure functions, no DOM and no network, so the server, the seed script and the tests share them.

// Airtable free plan: about 1,000 records per base. These caps keep the whole base under that.
export const LIMITS = { products: 250, shipments: 700 };
export const WAREHOUSE_IDS = ['CMH', 'RNO', 'ATL'];

// Table name -> [primary field, ...other fields]. The primary field is the stable key
// used for upserts, so running the seed twice never doubles a record.
export const TABLES = {
  Meta: ['key', 'generated_at', 'seed', 'currency', 'locale'],
  Warehouses: ['id', 'name', 'timezone'],
  Products: [
    'sku', 'name', 'category', 'unit_cost', 'supplier', 'lead_time_days',
    ...WAREHOUSE_IDS.flatMap((w) => [`qty_${w}`, `reorder_${w}`]),
  ],
  Shipments: ['id', 'direction', 'origin', 'destination', 'status', 'ship_date', 'eta', 'delivered_at', 'carrier', 'lines'],
  StockHistory: ['date', 'rows'],
};

/** Accepts a bare base ID or any pasted Airtable URL and returns just the "app…" ID. */
export function parseBaseId(value) {
  const m = String(value || '').match(/app[A-Za-z0-9]{14}/);
  return m ? m[0] : null;
}

const isOpenShipment = (s) => s.status === 'in_transit' || s.status === 'scheduled';

/** Picks the subset that goes to Airtable: risky SKUs first, open shipments first. */
export function selectSubset(data, limits = LIMITS) {
  const today = data.meta.generated_at.slice(0, 10);
  const byStatus = new Map();
  for (const r of data.stock) {
    const rank = r.qty_on_hand === 0 ? 0 : r.qty_on_hand <= r.reorder_point ? 1 : 2;
    byStatus.set(r.sku, Math.min(byStatus.get(r.sku) ?? 2, rank));
  }
  const products = data.products
    .slice()
    .sort((a, b) => (byStatus.get(a.sku) ?? 2) - (byStatus.get(b.sku) ?? 2) || a.sku.localeCompare(b.sku))
    .slice(0, limits.products);
  const skus = new Set(products.map((p) => p.sku));

  const open = data.shipments.filter(isOpenShipment).sort((a, b) => a.eta.localeCompare(b.eta));
  const delivered = data.shipments
    .filter((s) => s.status === 'delivered' && s.delivered_at <= today)
    .sort((a, b) => b.delivered_at.localeCompare(a.delivered_at));
  const shipments = [...open, ...delivered].slice(0, limits.shipments).map((s) => {
    const lines = s.lines.filter((l) => skus.has(l.sku));
    return { ...s, lines: lines.length ? lines : s.lines.slice(0, 1) };
  });

  // History was recorded for every SKU. Scale each warehouse × category series to the subset's
  // share of today's value, so the month-over-month change stays true for the subset.
  const stock = data.stock.filter((r) => skus.has(r.sku));
  const prod = new Map(data.products.map((p) => [p.sku, p]));
  const valueBy = (rows) => {
    const v = new Map();
    for (const r of rows) {
      const k = `${r.warehouse}|${prod.get(r.sku).category}`;
      v.set(k, (v.get(k) || 0) + r.qty_on_hand * prod.get(r.sku).unit_cost);
    }
    return v;
  };
  const full = valueBy(data.stock);
  const part = valueBy(stock);
  const stock_history = data.stock_history.map((h) => {
    const k = `${h.warehouse}|${h.category}`;
    const share = full.get(k) ? (part.get(k) || 0) / full.get(k) : 0;
    return { ...h, value: Math.round(h.value * share * 100) / 100 };
  });

  return { meta: data.meta, warehouses: data.warehouses, products, stock, stock_history, shipments };
}

/** Data set -> { tableName: [fields, ...] } ready to send to Airtable. */
export function toRecords(data) {
  const stockBySku = new Map();
  for (const r of data.stock) {
    const f = stockBySku.get(r.sku) || {};
    f[`qty_${r.warehouse}`] = r.qty_on_hand;
    f[`reorder_${r.warehouse}`] = r.reorder_point;
    stockBySku.set(r.sku, f);
  }
  const historyByDate = new Map();
  for (const h of data.stock_history) {
    if (!historyByDate.has(h.date)) historyByDate.set(h.date, []);
    historyByDate.get(h.date).push({ warehouse: h.warehouse, category: h.category, value: h.value });
  }
  return {
    Meta: [{ key: 'main', ...data.meta }],
    Warehouses: data.warehouses.map((w) => ({ ...w })),
    Products: data.products.map((p) => ({ ...p, ...stockBySku.get(p.sku) })),
    Shipments: data.shipments.map((s) => ({ ...s, delivered_at: s.delivered_at || '', lines: JSON.stringify(s.lines) })),
    StockHistory: [...historyByDate].map(([date, rows]) => ({ date, rows: JSON.stringify(rows) })),
  };
}

/** { tableName: [fields, ...] } read from Airtable -> the data set shape the dashboard uses. */
export function fromRecords(t) {
  const m = (t.Meta || [])[0];
  if (!m) throw new Error('Airtable base has no Meta record');
  const stock = [];
  const products = (t.Products || []).map((f) => {
    for (const w of WAREHOUSE_IDS) {
      if (f[`qty_${w}`] !== undefined) {
        stock.push({ sku: f.sku, warehouse: w, qty_on_hand: f[`qty_${w}`], reorder_point: f[`reorder_${w}`] ?? 0 });
      }
    }
    return {
      sku: f.sku, name: f.name, category: f.category, unit_cost: f.unit_cost,
      supplier: f.supplier, lead_time_days: f.lead_time_days,
    };
  });
  return {
    meta: { generated_at: m.generated_at, seed: m.seed, currency: m.currency, locale: m.locale, source: 'airtable' },
    warehouses: (t.Warehouses || []).map((f) => ({ id: f.id, name: f.name, timezone: f.timezone })),
    products,
    stock,
    stock_history: (t.StockHistory || [])
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .flatMap((f) => JSON.parse(f.rows).map((r) => ({ date: f.date, ...r }))),
    shipments: (t.Shipments || []).map((f) => ({
      id: f.id, direction: f.direction, origin: f.origin, destination: f.destination, status: f.status,
      ship_date: f.ship_date, eta: f.eta, delivered_at: f.delivered_at || null, carrier: f.carrier,
      lines: JSON.parse(f.lines || '[]'),
    })),
  };
}
