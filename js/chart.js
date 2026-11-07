// Stock value chart: hand-built inline SVG horizontal bars (SPEC §6.9).
import { valueByCategory, valueByWarehouse, stockValue, ALL } from './metrics.js';
import * as f from './format.js';

const CATEGORY_COLORS = ['var(--teal-700)', 'var(--amber-500)', 'var(--indigo-600)', 'var(--ink-600)', 'var(--line-200)'];
const WAREHOUSE_COLORS = { CMH: 'var(--teal-700)', RNO: 'var(--amber-500)', ATL: 'var(--indigo-600)' };
const SVG_NS = 'http://www.w3.org/2000/svg';

export function chartRows(data, wh, mode) {
  if (mode === 'warehouse') {
    const all = valueByWarehouse(data);
    const total = all.reduce((t, x) => t + x.value, 0);
    return all.map((w) => {
      const selected = wh === ALL || wh === w.id;
      return {
        name: selected ? w.name : `${w.name} (not selected)`,
        value: w.value,
        skus: w.skus,
        share: total ? (w.value / total) * 100 : 0,
        color: selected ? WAREHOUSE_COLORS[w.id] : 'var(--line-200)',
        outline: !selected,
        selected,
      };
    });
  }
  const total = stockValue(data, wh);
  return valueByCategory(data, wh)
    .sort((a, b) => b.value - a.value)
    .map((c, i) => ({
      name: c.name,
      value: c.value,
      skus: c.skus,
      share: total ? (c.value / total) * 100 : 0,
      color: CATEGORY_COLORS[i] || 'var(--line-200)',
      outline: i >= 4,
      selected: true,
    }));
}

export function summaryText(rows) {
  const sel = rows.filter((r) => r.selected);
  if (!sel.length) return '';
  const top = sel.reduce((a, b) => (b.value > a.value ? b : a));
  return `${top.name} holds the most stock value: ${f.moneyCompact(top.value)} (${f.oneDecimal(top.share)}%).`;
}

function niceStep(max) {
  const raw = max / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const n = raw / mag;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * mag;
}

export function renderChart(root, rows) {
  root.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'chart-wrap';
  root.append(wrap);

  const width = Math.max(260, (root.clientWidth || 632) - 32);
  const narrow = width < 480;
  const labelW = narrow ? 0 : Math.min(200, width * 0.32);
  const valueW = 72;
  const rowH = 48;
  const top = 8;
  const axisH = 28;
  const barH = narrow ? 18 : 24;
  const plotX = labelW;
  const plotW = Math.max(60, width - labelW - valueW);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const step = niceStep(max);
  const ticks = [];
  for (let v = step; v <= max + 1e-9 && ticks.length < 4; v += step) ticks.push(v);
  const scaleMax = max;
  const x = (v) => plotX + (v / scaleMax) * plotW;
  const plotBottom = top + rows.length * rowH;
  const height = plotBottom + axisH;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', 'Stock value bar chart');

  let html = '';
  for (const t of ticks) {
    html += `<line class="gridline" x1="${x(t)}" x2="${x(t)}" y1="${top}" y2="${plotBottom}"/>`;
    html += `<text class="axis-label" x="${x(t)}" y="${height - 8}" text-anchor="middle">${axisMoney(t)}</text>`;
  }
  html += `<text class="axis-label" x="${plotX}" y="${height - 8}" text-anchor="${narrow ? 'start' : 'middle'}">$0</text>`;

  rows.forEach((r, i) => {
    const y = top + i * rowH;
    const barY = narrow ? y + 24 : y + (rowH - barH) / 2;
    const w = Math.max(2, x(r.value) - plotX);
    const label = `${r.name}: ${f.moneyWhole(r.value)}, ${f.oneDecimal(r.share)}% of total, ${f.count(r.skus)} SKUs`;
    const nameText = narrow
      ? `<text class="bar__label" x="0" y="${y + 16}">${escapeXml(r.name)}</text>`
      : `<text class="bar__label" x="${labelW - 12}" y="${barY + barH / 2 + 5}" text-anchor="end">${escapeXml(truncate(r.name, Math.floor(labelW / 8)))}</text>`;
    const outline = r.outline ? ' stroke="var(--ink-600)" stroke-width="1"' : '';
    const amberEdge = r.color === 'var(--amber-500)'
      ? `<line x1="${plotX}" x2="${plotX + w}" y1="${barY + 0.5}" y2="${barY + 0.5}" stroke="var(--amber-800)" stroke-width="1"/>`
      : '';
    html += `<g class="bar" tabindex="0" role="img" aria-label="${escapeXml(label)}" data-i="${i}">
      <rect x="0" y="${y}" width="${width}" height="${rowH}" fill="transparent"/>
      ${nameText}
      <rect class="bar__rect" x="${plotX}" y="${barY}" width="${w}" height="${barH}" rx="4" fill="${r.color}"${outline}/>
      ${amberEdge}
      <text class="bar__value" x="${plotX + w + 8}" y="${barY + barH / 2 + 5}">${f.moneyCompact(r.value)}</text>
    </g>`;
  });
  svg.innerHTML = html;
  wrap.append(svg);

  const tip = document.createElement('div');
  tip.className = 'tooltip';
  tip.setAttribute('role', 'status');
  tip.hidden = true;
  wrap.append(tip);

  const show = (g) => {
    const r = rows[Number(g.dataset.i)];
    tip.textContent = `${r.name}: ${f.moneyWhole(r.value)} · ${f.oneDecimal(r.share)}% of total · ${f.count(r.skus)} SKUs`;
    tip.hidden = false;
    const box = g.getBoundingClientRect();
    const host = wrap.getBoundingClientRect();
    const left = Math.min(Math.max(0, (plotX / width) * host.width), Math.max(0, host.width - 260));
    tip.style.left = `${left}px`;
    tip.style.top = `${box.bottom - host.top}px`;
    wrap.dataset.open = g.dataset.i;
  };
  const hide = () => { tip.hidden = true; delete wrap.dataset.open; };

  svg.querySelectorAll('.bar').forEach((g) => {
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      if (wrap.dataset.open === g.dataset.i) hide(); else show(g);
    });
    g.addEventListener('focus', () => show(g));
    g.addEventListener('blur', hide);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(g); }
      if (e.key === 'Escape') hide();
    });
  });
  const outside = (e) => { if (!wrap.contains(e.target)) hide(); };
  document.addEventListener('click', outside);
  return () => document.removeEventListener('click', outside);
}

export function renderChartTable(root, rows, mode) {
  root.innerHTML = `<table class="data-table">
    <caption class="visually-hidden">Stock value by ${mode}</caption>
    <thead><tr>
      <th scope="col"><span class="sort-btn">${mode === 'warehouse' ? 'Warehouse' : 'Category'}</span></th>
      <th scope="col" class="num"><span class="sort-btn">Stock value</span></th>
      <th scope="col" class="num"><span class="sort-btn">Share</span></th>
      <th scope="col" class="num"><span class="sort-btn">SKUs</span></th>
    </tr></thead>
    <tbody>${rows.map((r) => `<tr class="static"><td>${escapeXml(r.name)}</td><td class="num">${f.money(r.value)}</td>
      <td class="num">${f.pct(r.share)}</td><td class="num">${f.count(r.skus)}</td></tr>`).join('')}</tbody>
  </table>`;
}

function axisMoney(v) {
  return f.moneyCompact(v).replace(/\.00(?=[KMB])/, '');
}
function truncate(s, n) {
  return s.length > n ? s.slice(0, Math.max(1, n - 1)) + '…' : s;
}
export function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
