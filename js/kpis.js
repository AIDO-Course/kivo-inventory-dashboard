// KPI tiles (SPEC §6.3).
import { kpis as computeKpis, monthBefore, today } from './metrics.js';
import * as f from './format.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function renderKpiSkeleton(root) {
  root.innerHTML = Array.from({ length: 7 }, () => '<li><div class="skeleton skeleton--tile"></div></li>').join('');
}

export function renderKpis(root, data, wh, onFilter) {
  const k = computeKpis(data, wh);
  const prev = monthBefore(today(data));
  const tiles = [
    { label: 'SKUs', icon: 'i-box', value: k.skus, fmt: f.count },
    {
      label: 'Stock value', icon: 'i-dollar', value: k.stockValue, fmt: f.moneyCompact,
      delta: k.stockValueMoM == null ? '' : `${f.delta(k.stockValueMoM)} vs ${f.dateShort(prev)}`, deltaClass: 'delta--neutral',
    },
    { label: 'Low stock', icon: 'i-warn', iconClass: 'kpi__icon--low', value: k.low, fmt: f.count, delta: 'SKUs at or below reorder point', action: 'filter-low' },
    { label: 'Out of stock', icon: 'i-out', iconClass: 'kpi__icon--out', value: k.out, fmt: f.count, delta: 'SKUs with 0 on hand', action: 'filter-out' },
    { label: 'In transit', icon: 'i-truck', value: k.inTransit, fmt: f.count, delta: 'shipments on the road' },
    { label: 'Late', icon: 'i-clock', iconClass: 'kpi__icon--late', value: k.late, fmt: f.count, delta: 'open shipments past ETA', action: 'filter-late' },
    {
      label: 'On-time %', icon: 'i-check', value: k.onTime ?? 0, fmt: (n) => f.pct(n),
      delta: k.onTimeDelta == null ? '' : `${f.delta(k.onTimeDelta, 'pts')} vs prior 30 days`,
      deltaClass: k.onTimeDelta > 0 ? 'delta--up' : k.onTimeDelta < 0 ? 'delta--down' : 'delta--neutral',
    },
  ];

  root.innerHTML = tiles.map((t, i) => {
    const tag = t.action ? 'button' : 'div';
    const attrs = t.action ? `type="button" data-action="${t.action}"` : '';
    return `<li class="kpi"><${tag} class="kpi__body" ${attrs} data-kpi="${i}">
      <span class="kpi__label"><svg class="icon ${t.iconClass || ''}" aria-hidden="true"><use href="#${t.icon}"/></svg>${t.label}</span>
      <span class="kpi__value" data-value="${t.value}">${t.fmt(t.value)}</span>
      ${t.delta ? `<span class="kpi__delta ${t.deltaClass || ''}">${t.delta}</span>` : ''}
    </${tag}></li>`;
  }).join('');

  root.querySelectorAll('button[data-action]').forEach((b) => b.addEventListener('click', () => onFilter(b.dataset.action)));
  countUp(root, tiles);
  return k;
}

function countUp(root, tiles) {
  if (reduced()) return;
  const els = [...root.querySelectorAll('.kpi__value')];
  const start = performance.now();
  const dur = 600;
  const step = (now) => {
    const p = Math.min(1, (now - start) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    els.forEach((el, i) => { el.textContent = tiles[i].fmt(p === 1 ? tiles[i].value : tiles[i].value * e); });
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
