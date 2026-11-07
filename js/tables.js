// Inventory and shipments tables: filter, sort, page (SPEC §6.4–6.6).
import {
  ALL, indexProducts, stockStatus, shipmentWarehouse, shipmentStatus, daysLate, isOpen, today, addDays,
} from './metrics.js';
import * as f from './format.js';
import { escapeXml as esc } from './chart.js';

export const PAGE_SIZE = 25;

const STATUS_META = {
  in: { label: 'In stock', icon: 'i-check' },
  low: { label: 'Low', icon: 'i-warn' },
  out: { label: 'Out', icon: 'i-out' },
  late: { label: 'Late', icon: 'i-clock' },
  in_transit: { label: 'In transit', icon: 'i-truck' },
  scheduled: { label: 'Scheduled', icon: 'i-calendar' },
  delivered: { label: 'Delivered', icon: 'i-check' },
};

export function badge(status) {
  const m = STATUS_META[status];
  return `<span class="badge badge--${status}"><svg class="icon" aria-hidden="true"><use href="#${m.icon}"/></svg>${m.label}</span>`;
}

// ---------- Inventory ----------
export function inventoryRows(data) {
  const products = indexProducts(data);
  const whName = Object.fromEntries(data.warehouses.map((w) => [w.id, w.name]));
  return data.stock.map((r) => {
    const p = products.get(r.sku);
    return {
      key: `${r.sku}|${r.warehouse}`,
      sku: r.sku,
      name: p.name,
      category: p.category,
      supplier: p.supplier,
      lead_time_days: p.lead_time_days,
      whId: r.warehouse,
      warehouse: whName[r.warehouse],
      qty: r.qty_on_hand,
      rop: r.reorder_point,
      unit_cost: p.unit_cost,
      value: r.qty_on_hand * p.unit_cost,
      status: stockStatus(r),
    };
  });
}

const INV_RANK = { out: 0, low: 1, in: 2 };

export function filterInventory(rows, inv, wh) {
  const q = inv.q.trim().toLowerCase();
  const whFilter = wh !== ALL ? wh : inv.warehouse;
  return rows.filter((r) => {
    if (q && !r.sku.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q)) return false;
    if (inv.category && r.category !== inv.category) return false;
    if (whFilter && r.whId !== whFilter) return false;
    if (inv.status === 'lowout') return r.status !== 'in';
    if (inv.status && r.status !== inv.status) return false;
    return true;
  });
}

export const INV_COLUMNS = [
  { key: 'status', label: 'Status' },
  { key: 'name', label: 'Product' },
  { key: 'sku', label: 'SKU' },
  { key: 'category', label: 'Category', cls: 'col-desktop' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'qty', label: 'Qty on hand', num: true },
  { key: 'rop', label: 'Reorder point', num: true },
  { key: 'unit_cost', label: 'Unit cost', num: true, cls: 'col-desktop' },
  { key: 'value', label: 'Stock value', num: true, cls: 'col-desktop' },
];

export function sortInventory(rows, sort) {
  const out = rows.slice();
  if (!sort) {
    return out.sort((a, b) => INV_RANK[a.status] - INV_RANK[b.status] || a.qty / a.rop - b.qty / b.rop || a.sku.localeCompare(b.sku));
  }
  const dir = sort.dir === 'desc' ? -1 : 1;
  const key = sort.key;
  return out.sort((a, b) => {
    const av = key === 'status' ? INV_RANK[a.status] : a[key];
    const bv = key === 'status' ? INV_RANK[b.status] : b[key];
    const c = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
    return c * dir || a.key.localeCompare(b.key);
  });
}

// ---------- Shipments ----------
export function shipmentRows(data) {
  const t = today(data);
  const from = addDays(t, -30);
  const whName = Object.fromEntries(data.warehouses.map((w) => [w.id, w.name]));
  const place = (v) => whName[v] || v;
  return data.shipments
    .filter((sh) => isOpen(sh) || (sh.delivered_at && sh.delivered_at > from && sh.delivered_at <= t))
    .map((sh) => ({
      key: sh.id,
      id: sh.id,
      direction: sh.direction,
      origin: place(sh.origin),
      destination: place(sh.destination),
      route: `${place(sh.origin)} → ${place(sh.destination)}`,
      whId: shipmentWarehouse(sh),
      ship_date: sh.ship_date,
      eta: sh.eta,
      delivered_at: sh.delivered_at,
      carrier: sh.carrier,
      lines: sh.lines,
      lineCount: sh.lines.length,
      status: shipmentStatus(sh, t),
      daysLate: daysLate(sh, t),
    }));
}

export function filterShipments(rows, sh, wh) {
  return rows.filter((r) => {
    if (wh !== ALL && r.whId !== wh) return false;
    if (sh.direction && r.direction !== sh.direction) return false;
    if (sh.status && r.status !== sh.status) return false;
    return true;
  });
}

export const SH_COLUMNS = [
  { key: 'status', label: 'Status' },
  { key: 'id', label: 'Shipment ID' },
  { key: 'direction', label: 'Direction' },
  { key: 'route', label: 'Origin → Destination' },
  { key: 'ship_date', label: 'Ship date', cls: 'col-desktop' },
  { key: 'eta', label: 'ETA' },
  { key: 'carrier', label: 'Carrier', cls: 'col-desktop' },
  { key: 'lineCount', label: 'Lines', num: true },
];

const SH_RANK = { late: 0, in_transit: 1, scheduled: 2, delivered: 3 };

export function sortShipments(rows, sort) {
  const out = rows.slice();
  if (!sort) {
    return out.sort((a, b) => (a.status === 'late' ? 0 : 1) - (b.status === 'late' ? 0 : 1) || a.eta.localeCompare(b.eta) || a.id.localeCompare(b.id));
  }
  const dir = sort.dir === 'desc' ? -1 : 1;
  return out.sort((a, b) => {
    const av = sort.key === 'status' ? SH_RANK[a.status] : a[sort.key];
    const bv = sort.key === 'status' ? SH_RANK[b.status] : b[sort.key];
    const c = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
    return c * dir || a.id.localeCompare(b.id);
  });
}

// ---------- Rendering ----------
export function pageCount(n) {
  return Math.max(1, Math.ceil(n / PAGE_SIZE));
}

function headerCells(columns, sort) {
  return columns.map((c) => {
    const active = sort && sort.key === c.key;
    const ariaSort = active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none';
    const arrow = active ? (sort.dir === 'asc' ? '▲' : '▼') : '';
    return `<th scope="col" class="${c.num ? 'num ' : ''}${c.cls || ''}" aria-sort="${ariaSort}">
      <button type="button" class="sort-btn" data-sort="${c.key}">${c.label}<span class="sort-btn__arrow" aria-hidden="true">${arrow}</span></button></th>`;
  }).join('');
}

function pager(total, page) {
  const pages = pageCount(total);
  const from = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(total, page * PAGE_SIZE);
  const nums = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const list = [...nums].sort((a, b) => a - b);
  let btns = `<button type="button" class="btn btn--secondary" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>‹ Prev</button>`;
  let last = 0;
  for (const p of list) {
    if (p - last > 1) btns += '<span aria-hidden="true">…</span>';
    btns += `<button type="button" class="btn btn--secondary" data-page="${p}" ${p === page ? 'aria-current="page"' : ''} aria-label="Page ${p}">${p}</button>`;
    last = p;
  }
  btns += `<button type="button" class="btn btn--secondary" data-page="${page + 1}" ${page === pages ? 'disabled' : ''}>Next ›</button>`;
  return `<nav class="pager" aria-label="Pagination"><span>Showing ${f.count(from)}–${f.count(to)} of ${f.count(total)}</span>
    <div class="pager__btns">${btns}</div></nav>`;
}

function empty(text) {
  return `<div class="empty"><svg class="icon" aria-hidden="true"><use href="#i-search"/></svg>
    <p>${text}</p><button type="button" class="btn btn--secondary" data-clear>Clear filters</button></div>`;
}

export function renderInventory(root, rows, inv) {
  if (!rows.length) { root.innerHTML = empty('No products match these filters.'); return; }
  const page = Math.min(inv.page, pageCount(rows.length));
  const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const tr = slice.map((r) => `<tr tabindex="0" data-key="${esc(r.key)}">
      <td>${badge(r.status)}</td>
      <td class="truncate" title="${esc(r.name)}">${esc(r.name)}</td>
      <td>${r.sku}</td>
      <td class="col-desktop">${esc(r.category)}</td>
      <td>${esc(r.warehouse)}</td>
      <td class="num">${f.count(r.qty)}</td>
      <td class="num">${f.count(r.rop)}</td>
      <td class="num col-desktop">${f.money(r.unit_cost)}</td>
      <td class="num col-desktop">${f.money(r.value)}</td>
    </tr>`).join('');
  const cards = slice.map((r) => `<li tabindex="0" data-key="${esc(r.key)}">
      <div class="card-list__row">${badge(r.status)}<span class="card-list__meta">${esc(r.warehouse)}</span></div>
      <span class="card-list__name" title="${esc(r.name)}">${esc(r.name)}</span>
      <span class="card-list__meta">${r.sku} · ${f.count(r.qty)} / ${f.count(r.rop)} on hand</span>
    </li>`).join('');
  root.innerHTML = `<div class="table-scroll"><table class="data-table">
      <caption class="visually-hidden">Inventory, filtered</caption>
      <thead><tr>${headerCells(INV_COLUMNS, inv.sort)}</tr></thead><tbody>${tr}</tbody></table></div>
    <ul class="card-list" aria-label="Inventory">${cards}</ul>${pager(rows.length, page)}`;
}

export function renderShipments(root, rows, sh) {
  if (!rows.length) { root.innerHTML = empty('No shipments match these filters.'); return; }
  const page = Math.min(sh.page, pageCount(rows.length));
  const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const eta = (r) => (r.status === 'late'
    ? `<span class="eta-late">${f.dateShort(r.eta)} (${r.daysLate} ${r.daysLate === 1 ? 'day' : 'days'} late)</span>`
    : f.date(r.eta));
  const dir = (d) => (d === 'inbound' ? 'Inbound' : 'Outbound');
  const tr = slice.map((r) => `<tr tabindex="0" data-key="${r.key}">
      <td>${badge(r.status)}</td>
      <td>${r.id}</td>
      <td>${dir(r.direction)}</td>
      <td class="truncate" title="${esc(r.route)}">${esc(r.route)}</td>
      <td class="col-desktop">${f.date(r.ship_date)}</td>
      <td>${eta(r)}</td>
      <td class="col-desktop">${esc(r.carrier)}</td>
      <td class="num">${r.lineCount}</td>
    </tr>`).join('');
  const cards = slice.map((r) => `<li tabindex="0" data-key="${r.key}">
      <div class="card-list__row">${badge(r.status)}<span class="card-list__meta">${r.id} · ${dir(r.direction)}</span></div>
      <span class="card-list__name">${esc(r.route)}</span>
      <span class="card-list__meta">ETA ${eta(r)} · ${r.lineCount} lines</span>
    </li>`).join('');
  root.innerHTML = `<div class="table-scroll"><table class="data-table">
      <caption class="visually-hidden">Shipments, filtered</caption>
      <thead><tr>${headerCells(SH_COLUMNS, sh.sort)}</tr></thead><tbody>${tr}</tbody></table></div>
    <ul class="card-list" aria-label="Shipments">${cards}</ul>${pager(rows.length, page)}`;
}

export function skeletonRows(root) {
  root.innerHTML = Array.from({ length: 8 }, () => '<div class="skeleton skeleton--row"></div>').join('');
}
