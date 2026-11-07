// Row-detail dialog (SPEC §6.7). Read-only: no edit controls of any kind.
import * as f from './format.js';
import { badge } from './tables.js';
import { escapeXml as esc } from './chart.js';

let opener = null;

export function initDialog() {
  const dlg = document.getElementById('detail');
  document.getElementById('detail-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => {
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
  });
}

function dl(pairs) {
  return `<dl>${pairs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
}

export function openStock(row, openInbound, trigger) {
  const body = dl([
    ['Status', badge(row.status)],
    ['Product', esc(row.name)],
    ['SKU', row.sku],
    ['Category', esc(row.category)],
    ['Warehouse', esc(row.warehouse)],
    ['Qty on hand', f.count(row.qty)],
    ['Reorder point', f.count(row.rop)],
    ['Unit cost', f.money(row.unit_cost)],
    ['Stock value', f.money(row.value)],
    ['Supplier', esc(row.supplier)],
    ['Lead time', `${row.lead_time_days} days`],
  ]);
  const inbound = openInbound.length
    ? `<ul>${openInbound.map((s) => `<li>${s.id}: ${f.count(s.qty)} units, ETA ${f.date(s.eta)}</li>`).join('')}</ul>`
    : '<p>No open inbound shipments.</p>';
  show(esc(row.name), `${body}<section><h3>Open inbound shipments</h3>${inbound}</section>`, trigger);
}

export function openShipment(row, trigger) {
  const delivered = row.delivered_at ? f.date(row.delivered_at) : 'Not yet';
  const body = dl([
    ['Status', badge(row.status)],
    ['Shipment ID', row.id],
    ['Direction', row.direction === 'inbound' ? 'Inbound' : 'Outbound'],
    ['Origin', esc(row.origin)],
    ['Destination', esc(row.destination)],
    ['Ship date', f.date(row.ship_date)],
    ['ETA', f.date(row.eta)],
    ['Delivered', delivered],
    ['Days late', row.daysLate ? String(row.daysLate) : '0'],
    ['Carrier', esc(row.carrier)],
    ['Lines', String(row.lineCount)],
  ]);
  const lines = `<ul>${row.lines.map((l) => `<li>${l.sku}: ${f.count(l.qty)} units</li>`).join('')}</ul>`;
  show(`Shipment ${row.id}`, `${body}<section><h3>Lines</h3>${lines}</section>`, trigger);
}

function show(title, html, trigger) {
  const dlg = document.getElementById('detail');
  document.getElementById('detail-title').innerHTML = title;
  document.getElementById('detail-body').innerHTML = html;
  opener = trigger || document.activeElement;
  if (!dlg.open) dlg.showModal();
  document.getElementById('detail-close').focus();
}
