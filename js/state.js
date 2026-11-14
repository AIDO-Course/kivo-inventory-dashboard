// Single store with subscribe/notify. Filters reset on reload; the view and the warehouse live in the URL hash.
import { ALL } from './metrics.js';

const listeners = new Set();

export const defaultInv = () => ({ q: '', category: '', warehouse: '', status: '', sort: null, page: 1 });
export const defaultSh = () => ({ direction: '', status: '', sort: null, page: 1 });

export const VIEWS = ['overview', 'inventory', 'shipments', 'weather'];

export const state = {
  data: null,
  view: 'overview',
  wh: ALL,
  chartMode: 'category',
  chartTable: false,
  inv: defaultInv(),
  sh: defaultSh(),
};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Merge a patch into state and notify. `reason` lets views skip work they don't need. */
export function update(patch, reason = 'all') {
  Object.assign(state, patch);
  for (const fn of listeners) fn(state, reason);
}

export function readHashWarehouse(validIds) {
  const m = /(?:^#|&)wh=([A-Z]+)/.exec(location.hash);
  return m && validIds.includes(m[1]) ? m[1] : ALL;
}

export function readHashView() {
  const m = /(?:^#|&)view=([a-z]+)/.exec(location.hash);
  return m && VIEWS.includes(m[1]) ? m[1] : 'overview';
}

/** "#view=inventory&wh=RNO"; defaults (overview, all warehouses) are left out. */
export function hashFor(view, wh) {
  const parts = [];
  if (view !== 'overview') parts.push(`view=${view}`);
  if (wh !== ALL) parts.push(`wh=${wh}`);
  return parts.length ? `#${parts.join('&')}` : location.pathname + location.search;
}

export function writeHashWarehouse(wh) {
  history.replaceState(null, '', hashFor(state.view, wh));
}

/** A view change is a new history entry, so the browser Back button returns to the previous view. */
export function writeHashView(view) {
  const next = hashFor(view, state.wh);
  if (next !== location.hash && !(next.startsWith('/') && !location.hash)) history.pushState(null, '', next);
}
