// Single store with subscribe/notify. Filters reset on reload; only the warehouse lives in the URL hash.
import { ALL } from './metrics.js';

const listeners = new Set();

export const defaultInv = () => ({ q: '', category: '', warehouse: '', status: '', sort: null, page: 1 });
export const defaultSh = () => ({ direction: '', status: '', sort: null, page: 1 });

export const state = {
  data: null,
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

export function writeHashWarehouse(wh) {
  const next = wh === ALL ? location.pathname + location.search : `#wh=${wh}`;
  history.replaceState(null, '', next);
}
