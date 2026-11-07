// Pure metric functions. Every formula here is defined in SPEC.md §7.1.
// No DOM access, so the same module runs in the browser and in Node tests.

export const ALL = 'ALL';

export function today(data) {
  return data.meta.generated_at.slice(0, 10);
}

export function addDays(isoDate, n) {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function dayDiff(a, b) {
  return Math.round((new Date(a + 'T00:00:00Z') - new Date(b + 'T00:00:00Z')) / 86400000);
}

export function indexProducts(data) {
  const map = new Map();
  for (const p of data.products) map.set(p.sku, p);
  return map;
}

export function stockRows(data, wh = ALL) {
  return wh === ALL ? data.stock : data.stock.filter((r) => r.warehouse === wh);
}

/** Out if qty = 0; Low if 0 < qty <= reorder_point; In stock otherwise. */
export function stockStatus(row) {
  if (row.qty_on_hand === 0) return 'out';
  if (row.qty_on_hand <= row.reorder_point) return 'low';
  return 'in';
}

export function skuCount(data, wh = ALL) {
  return new Set(stockRows(data, wh).map((r) => r.sku)).size;
}

export function stockValue(data, wh = ALL, products = indexProducts(data)) {
  return stockRows(data, wh).reduce((t, r) => t + r.qty_on_hand * products.get(r.sku).unit_cost, 0);
}

export function lowCount(data, wh = ALL) {
  return stockRows(data, wh).filter((r) => stockStatus(r) === 'low').length;
}

export function outCount(data, wh = ALL) {
  return stockRows(data, wh).filter((r) => stockStatus(r) === 'out').length;
}

export function historyValue(data, date, wh = ALL) {
  return data.stock_history
    .filter((h) => h.date === date && (wh === ALL || h.warehouse === wh))
    .reduce((t, h) => t + h.value, 0);
}

/** (value today - value one month ago) / value one month ago * 100 */
export function stockValueMoM(data, wh = ALL, products = indexProducts(data)) {
  const prevDate = monthBefore(today(data));
  const prev = historyValue(data, prevDate, wh);
  if (!prev) return null;
  return ((stockValue(data, wh, products) - prev) / prev) * 100;
}

export function monthBefore(isoDate) {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 10);
}

/** A shipment belongs to a warehouse if it arrives there (inbound) or leaves from it (outbound). */
export function shipmentWarehouse(sh) {
  return sh.direction === 'inbound' ? sh.destination : sh.origin;
}

export function shipmentsFor(data, wh = ALL) {
  return wh === ALL ? data.shipments : data.shipments.filter((sh) => shipmentWarehouse(sh) === wh);
}

export function isOpen(sh) {
  return sh.status === 'scheduled' || sh.status === 'in_transit';
}

/** Late = open and eta < today (date part). Derived, never stored. */
export function isLate(sh, todayIso) {
  return isOpen(sh) && sh.eta < todayIso;
}

/** UI status: late | scheduled | in_transit | delivered */
export function shipmentStatus(sh, todayIso) {
  return isLate(sh, todayIso) ? 'late' : sh.status;
}

export function daysLate(sh, todayIso) {
  if (isOpen(sh)) return Math.max(0, dayDiff(todayIso, sh.eta));
  if (sh.delivered_at) return Math.max(0, dayDiff(sh.delivered_at, sh.eta));
  return 0;
}

export function inTransitCount(data, wh = ALL) {
  return shipmentsFor(data, wh).filter((sh) => sh.status === 'in_transit').length;
}

export function lateCount(data, wh = ALL) {
  const t = today(data);
  return shipmentsFor(data, wh).filter((sh) => isLate(sh, t)).length;
}

/** On-time % for deliveries with delivered_at in (end - days, end]. */
export function onTimePct(data, wh = ALL, fromDaysAgo = 0, windowDays = 30) {
  const t = today(data);
  const end = addDays(t, -fromDaysAgo);
  const start = addDays(end, -windowDays);
  const delivered = shipmentsFor(data, wh).filter(
    (sh) => sh.status === 'delivered' && sh.delivered_at > start && sh.delivered_at <= end,
  );
  if (!delivered.length) return null;
  const onTime = delivered.filter((sh) => sh.delivered_at <= sh.eta).length;
  return (onTime / delivered.length) * 100;
}

/** Percentage points: last 30 days minus days 31-60. */
export function onTimeDelta(data, wh = ALL) {
  const a = onTimePct(data, wh, 0);
  const b = onTimePct(data, wh, 30);
  return a == null || b == null ? null : a - b;
}

export function valueByCategory(data, wh = ALL, products = indexProducts(data)) {
  const out = new Map();
  const counts = new Map();
  for (const r of stockRows(data, wh)) {
    const p = products.get(r.sku);
    out.set(p.category, (out.get(p.category) || 0) + r.qty_on_hand * p.unit_cost);
    counts.set(p.category, (counts.get(p.category) || new Set()).add(r.sku));
  }
  return [...out.entries()].map(([name, value]) => ({ name, value, skus: counts.get(name).size }));
}

export function valueByWarehouse(data, products = indexProducts(data)) {
  return data.warehouses.map((w) => {
    const rows = stockRows(data, w.id);
    return {
      id: w.id,
      name: w.name,
      value: rows.reduce((t, r) => t + r.qty_on_hand * products.get(r.sku).unit_cost, 0),
      skus: rows.length,
    };
  });
}

/** Low-stock alerts: Out first, then Low by qty / reorder_point ascending. */
export function lowStockAlerts(data, wh = ALL) {
  const rank = { out: 0, low: 1 };
  return stockRows(data, wh)
    .filter((r) => stockStatus(r) !== 'in')
    .sort((a, b) => rank[stockStatus(a)] - rank[stockStatus(b)] || a.qty_on_hand / a.reorder_point - b.qty_on_hand / b.reorder_point);
}

export function kpis(data, wh = ALL) {
  const products = indexProducts(data);
  return {
    skus: skuCount(data, wh),
    stockValue: stockValue(data, wh, products),
    stockValueMoM: stockValueMoM(data, wh, products),
    low: lowCount(data, wh),
    out: outCount(data, wh),
    inTransit: inTransitCount(data, wh),
    late: lateCount(data, wh),
    onTime: onTimePct(data, wh),
    onTimeDelta: onTimeDelta(data, wh),
  };
}
