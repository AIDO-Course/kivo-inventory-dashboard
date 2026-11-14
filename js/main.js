// Entry point: loads data, wires controls, renders views on state change.
import { loadData } from './data.js';
import { state, update, subscribe, defaultInv, defaultSh, readHashWarehouse, writeHashWarehouse } from './state.js';
import { ALL, lowStockAlerts, indexProducts, isOpen } from './metrics.js';
import { renderKpis, renderKpiSkeleton } from './kpis.js';
import { chartRows, renderChart, renderChartTable, summaryText, escapeXml as esc } from './chart.js';
import {
  inventoryRows, filterInventory, sortInventory, renderInventory,
  shipmentRows, filterShipments, sortShipments, renderShipments, skeletonRows, badge, pageCount,
} from './tables.js';
import { initDialog, openStock, openShipment } from './dialog.js';
import * as f from './format.js';

const $ = (id) => document.getElementById(id);
let invAll = [];
let shAll = [];
let invFiltered = [];
let shFiltered = [];
let cleanupChart = null;
let lastLoaded = false;

// ---------- Loading / error ----------
function showSkeletons() {
  renderKpiSkeleton($('kpis'));
  $('chart').innerHTML = '<div class="skeleton skeleton--chart"></div>';
  skeletonRows($('inv-card'));
  skeletonRows($('sh-card'));
  announce('Loading dashboard data…');
}

async function load() {
  $('error-banner').hidden = true;
  if (!lastLoaded) showSkeletons();
  try {
    const data = await loadData();
    lastLoaded = true;
    $('stale-badge').hidden = true;
    init(data);
  } catch (err) {
    console.warn('Data load failed:', err.message);
    $('error-text').textContent = lastLoaded
      ? "Couldn't load the latest data. Showing the last loaded numbers."
      : "Couldn't load dashboard data.";
    $('stale-badge').hidden = !lastLoaded;
    $('error-banner').hidden = false;
  }
}

// ---------- Init ----------
let wired = false;
function init(data) {
  invAll = inventoryRows(data);
  shAll = shipmentRows(data);
  $('data-asof-text').textContent = `Data as of ${f.asOf(data.meta.generated_at)}`;
  $('source-badge').textContent = data.meta.source === 'airtable' ? 'Live · Airtable' : 'Mock data';

  const whSel = $('wh-select');
  const invWh = $('inv-warehouse');
  whSel.length = 1;
  invWh.length = 1;
  for (const w of data.warehouses) {
    whSel.add(new Option(w.name, w.id));
    invWh.add(new Option(w.name, w.id));
  }
  const cat = $('inv-category');
  cat.length = 1;
  for (const c of [...new Set(data.products.map((p) => p.category))].sort()) cat.add(new Option(c, c));

  const wh = readHashWarehouse(data.warehouses.map((w) => w.id));
  if (!wired) { wire(); wired = true; }
  update({ data, wh });
}

// ---------- Rendering ----------
function render(s, reason) {
  if (!s.data) return;
  const overview = reason === 'all' || reason === 'wh';
  const chart = overview || reason === 'chart';
  const inv = overview || reason === 'inv';
  const sh = overview || reason === 'sh';

  if (overview) {
    $('wh-select').value = s.wh;
    const locked = s.wh !== ALL;
    $('inv-warehouse').disabled = locked;
    $('inv-warehouse').value = locked ? s.wh : s.inv.warehouse;
    $('inv-wh-note').hidden = !locked;
    const k = renderKpis($('kpis'), s.data, s.wh, applyFilter);
    renderAlertsStrip(k);
    renderAlertsPanel(s);
  }
  if (chart) renderChartArea(s);
  if (inv) renderInv(s);
  if (sh) renderSh(s);
}

function renderAlertsStrip(k) {
  const strip = $('alerts-strip');
  strip.hidden = k.out + k.low + k.late === 0;
  strip.querySelector('[data-count="out"]').textContent = f.count(k.out);
  strip.querySelector('[data-count="low"]').textContent = f.count(k.low);
  strip.querySelector('[data-count="late"]').textContent = f.count(k.late);
}

function renderAlertsPanel(s) {
  const alerts = lowStockAlerts(s.data, s.wh);
  const products = indexProducts(s.data);
  const whName = Object.fromEntries(s.data.warehouses.map((w) => [w.id, w.name]));
  $('alerts-count').textContent = f.count(alerts.length);
  $('alerts-see-all').hidden = alerts.length === 0;
  $('alerts-list').innerHTML = alerts.length
    ? alerts.slice(0, 8).map((r) => {
      const status = r.qty_on_hand === 0 ? 'out' : 'low';
      const name = products.get(r.sku).name;
      return `<li>${badge(status)}<span class="alerts-list__name" title="${esc(name)}">${esc(name)}</span>
        <span class="alerts-list__meta">${f.count(r.qty_on_hand)} / ${f.count(r.reorder_point)} on hand · ${esc(whName[r.warehouse])}</span></li>`;
    }).join('')
    : '<li class="alerts-list__empty">✓ Nothing below reorder point.</li>';
}

function renderChartArea(s) {
  const rows = chartRows(s.data, s.wh, s.chartMode);
  document.querySelectorAll('[data-chart-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.chartMode === s.chartMode)));
  $('chart-summary').textContent = summaryText(rows);
  const toggle = $('chart-table-toggle');
  toggle.setAttribute('aria-pressed', String(s.chartTable));
  toggle.querySelector('span').textContent = s.chartTable ? 'Show as chart' : 'Show as table';
  $('chart').hidden = s.chartTable;
  $('chart-table').hidden = !s.chartTable;
  if (cleanupChart) cleanupChart();
  cleanupChart = null;
  if (s.chartTable) renderChartTable($('chart-table'), rows, s.chartMode);
  else cleanupChart = renderChart($('chart'), rows);
}

function invActive(inv) {
  return Boolean(inv.q || inv.category || inv.warehouse || inv.status);
}
function shActive(sh) {
  return Boolean(sh.direction || sh.status);
}

function renderInv(s) {
  invFiltered = sortInventory(filterInventory(invAll, s.inv, s.wh), s.inv.sort);
  const totalForScope = s.wh === ALL ? invAll.length : invAll.filter((r) => r.whId === s.wh).length;
  $('inv-count').textContent = invActive(s.inv) ? `${f.count(invFiltered.length)} of ${f.count(totalForScope)}` : f.count(invFiltered.length);
  $('inv-clear').hidden = !invActive(s.inv);
  $('inv-search').value = s.inv.q;
  $('inv-category').value = s.inv.category;
  $('inv-status').value = s.inv.status;
  renderInventory($('inv-card'), invFiltered, s.inv);
  if (s.inv.page > pageCount(invFiltered.length)) s.inv.page = pageCount(invFiltered.length);
}

function renderSh(s) {
  shFiltered = sortShipments(filterShipments(shAll, s.sh, s.wh), s.sh.sort);
  $('sh-count').textContent = f.count(shFiltered.length);
  $('sh-clear').hidden = !shActive(s.sh);
  $('sh-status').value = s.sh.status;
  document.querySelectorAll('[data-direction]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.direction === s.sh.direction)));
  renderShipments($('sh-card'), shFiltered, s.sh);
  if (s.sh.page > pageCount(shFiltered.length)) s.sh.page = pageCount(shFiltered.length);
}

function announce(text) {
  $('live').textContent = text;
}

// ---------- Actions ----------
function setInv(patch, scroll = false) {
  update({ inv: { ...state.inv, page: 1, ...patch } }, 'inv');
  announce(`${f.count(invFiltered.length)} products shown`);
  if (scroll) $('inventory').scrollIntoView();
}
function setSh(patch, scroll = false) {
  update({ sh: { ...state.sh, page: 1, ...patch } }, 'sh');
  announce(`${f.count(shFiltered.length)} shipments shown`);
  if (scroll) $('shipments').scrollIntoView();
}

function applyFilter(action) {
  if (action === 'filter-out') setInv({ ...defaultInv(), status: 'out' }, true);
  if (action === 'filter-low') setInv({ ...defaultInv(), status: 'low' }, true);
  if (action === 'filter-lowout') setInv({ ...defaultInv(), status: 'lowout' }, true);
  if (action === 'filter-late') setSh({ ...defaultSh(), status: 'late' }, true);
}

function nextSort(current, key) {
  if (current && current.key === key) return { key, dir: current.dir === 'asc' ? 'desc' : 'asc' };
  return { key, dir: 'asc' };
}

function wireTable(card, kind) {
  card.addEventListener('click', (e) => {
    const sortBtn = e.target.closest('[data-sort]');
    if (sortBtn) {
      if (kind === 'inv') setInv({ sort: nextSort(state.inv.sort, sortBtn.dataset.sort) });
      else setSh({ sort: nextSort(state.sh.sort, sortBtn.dataset.sort) });
      card.querySelector(`[data-sort="${sortBtn.dataset.sort}"]`)?.focus();
      return;
    }
    const pageBtn = e.target.closest('[data-page]');
    if (pageBtn && !pageBtn.disabled) {
      const page = Number(pageBtn.dataset.page);
      if (kind === 'inv') update({ inv: { ...state.inv, page } }, 'inv');
      else update({ sh: { ...state.sh, page } }, 'sh');
      card.querySelector(`[data-page="${page}"][aria-current]`)?.focus();
      return;
    }
    if (e.target.closest('[data-clear]')) {
      if (kind === 'inv') setInv(defaultInv()); else setSh(defaultSh());
      return;
    }
    const row = e.target.closest('[data-key]');
    if (row) openRow(kind, row);
  });
  card.addEventListener('keydown', (e) => {
    const row = e.target.closest('[data-key]');
    if (row && e.target === row && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openRow(kind, row);
    }
  });
}

function openRow(kind, el) {
  const key = el.dataset.key;
  if (kind === 'inv') {
    const row = invAll.find((r) => r.key === key);
    const inbound = state.data.shipments
      .filter((sh) => sh.direction === 'inbound' && isOpen(sh) && sh.destination === row.whId)
      .flatMap((sh) => sh.lines.filter((l) => l.sku === row.sku).map((l) => ({ id: sh.id, qty: l.qty, eta: sh.eta })));
    openStock(row, inbound, el);
  } else {
    openShipment(shAll.find((r) => r.key === key), el);
  }
}

function wire() {
  $('wh-select').addEventListener('change', (e) => {
    const wh = e.target.value;
    writeHashWarehouse(wh);
    update({ wh, inv: { ...state.inv, page: 1 }, sh: { ...state.sh, page: 1 } }, 'wh');
  });
  window.addEventListener('hashchange', () => {
    if (!state.data) return;
    const wh = readHashWarehouse(state.data.warehouses.map((w) => w.id));
    if (wh !== state.wh) update({ wh }, 'wh');
  });

  document.querySelectorAll('#alerts-strip [data-action]').forEach((b) => b.addEventListener('click', () => applyFilter(b.dataset.action)));
  $('alerts-see-all').addEventListener('click', () => applyFilter('filter-lowout'));

  document.querySelectorAll('[data-chart-mode]').forEach((b) => b.addEventListener('click', () => update({ chartMode: b.dataset.chartMode }, 'chart')));
  $('chart-table-toggle').addEventListener('click', () => update({ chartTable: !state.chartTable }, 'chart'));

  let t;
  $('inv-search').addEventListener('input', (e) => {
    clearTimeout(t);
    const q = e.target.value;
    t = setTimeout(() => setInv({ q }), 200);
  });
  $('inv-category').addEventListener('change', (e) => setInv({ category: e.target.value }));
  $('inv-warehouse').addEventListener('change', (e) => setInv({ warehouse: e.target.value }));
  $('inv-status').addEventListener('change', (e) => setInv({ status: e.target.value }));
  $('inv-clear').addEventListener('click', () => setInv(defaultInv()));

  document.querySelectorAll('[data-direction]').forEach((b) => b.addEventListener('click', () => setSh({ direction: b.dataset.direction })));
  $('sh-status').addEventListener('change', (e) => setSh({ status: e.target.value }));
  $('sh-clear').addEventListener('click', () => setSh(defaultSh()));

  wireTable($('inv-card'), 'inv');
  wireTable($('sh-card'), 'sh');

  $('retry-btn').addEventListener('click', load);

  let resizeTimer;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (state.data && !state.chartTable) renderChartArea(state); }, 120);
  }).observe($('chart'));

  // Section links scroll without touching the hash, so #wh= stays intact.
  document.querySelectorAll('.section-nav__link, .brand').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    $(a.getAttribute('href').slice(1)).scrollIntoView();
  }));

  // Active section link
  const links = [...document.querySelectorAll('.section-nav__link')];
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) {
        links.forEach((l) => (l.getAttribute('href') === `#${en.target.id}` ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
      }
    }
  }, { rootMargin: '-40% 0px -55% 0px' });
  ['overview', 'inventory', 'shipments'].forEach((id) => io.observe($(id)));

  initDialog();
}

subscribe(render);
load();
