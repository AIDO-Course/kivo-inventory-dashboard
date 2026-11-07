<img src="assets/logo.svg" alt="Kivo" height="40">

# Kivo: Inventory & Logistics Dashboard

A desktop-first dashboard for **Kivo**, a fictional US wholesale distributor of office supplies and electronics with warehouses in Columbus OH, Reno NV and Atlanta GA. It answers three questions at a glance: what is about to run out, which shipments are late, and how much stock value Kivo holds and where. It is a read-only decision aid for the operations manager, warehouse supervisors and buyers.

**Status:** v1. All numbers are mock data, frozen at Nov 7, 2026, 8:00 AM ET. There is no backend.

**Spec:** [SPEC.md](SPEC.md) is the source of truth. The dashboard is built from it.

## Features (v1)

- **7 KPI tiles:** SKUs, stock value (with month-over-month change), low stock, out of stock, in transit, late shipments and on-time %.
- **Warehouse switcher:** All, Columbus OH, Reno NV or Atlanta GA. It updates every number on the page and is kept in the URL (`#wh=RNO`).
- **Alerts strip and low-stock alerts panel:** out of stock first, then low. Each one links into the filtered inventory table.
- **Inventory table:** search by SKU or name, filter by category, warehouse and status, sort any column, 25 rows per page.
- **Shipments list:** inbound and outbound shipments, late ones first with "(N days late)", filtered by direction and status.
- **Stock value chart:** by category or by warehouse, in hand-built SVG, with a click/keyboard tooltip, a text summary and a "Show as table" view.
- **Row-detail dialog:** every field of a SKU or shipment, including the columns hidden on smaller screens.
- **"Data as of" caption** with a Mock data badge, plus loading, empty and error states.
- **Responsive and accessible:** phone, tablet and desktop. All text meets AA contrast, touch targets are at least 44 px, keyboard navigation works, and reduced motion is respected.

## Not built yet

- 30-day stock movement trend (Should, v1.1)
- CSV export of the inventory table (Should, v1.1)
- On-time % per carrier (Should, v1.1)
- Real WMS/ERP data, reorder suggestions, supplier performance and PWA install (Later)

## Live site

GitHub Pages: not published yet. The link will be added here when Pages is enabled.

## Run it locally

ES modules don't load from `file://`, so serve the folder:

```bash
python -m http.server 8765
```

Then open http://localhost:8765. If port 8765 is busy, use any other port.

To regenerate the mock data (it comes out the same every time for the same seed):

```bash
node scripts/generate-data.js
```

## Tests

Node tests check the metric formulas, the mock data rules, the palette and that no frameworks are used:

```bash
node tests/run-tests.mjs
```

Browser tests check filters, sorting, the warehouse switch, the dialog, states, touch targets and no horizontal scroll at 320 to 1440 px. With the local server running, open http://localhost:8765/tests/tests.html.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The single page: header, overview, inventory, shipments, dialog |
| `css/styles.css` | All styles, in `@layer`s, with every design token as a CSS variable |
| `js/main.js` | Entry point: loads data, wires controls, renders on state change |
| `js/data.js` | Fetches and validates `data/mock-data.json` |
| `js/state.js` | App state with subscribe/notify, and the `#wh=` URL hash |
| `js/metrics.js` | Pure functions for every metric formula in SPEC.md §7.1 |
| `js/kpis.js` | KPI tiles and count-up |
| `js/chart.js` | Stock value bar chart (inline SVG) and its table view |
| `js/tables.js` | Inventory and shipments tables: filter, sort, page |
| `js/dialog.js` | Row-detail dialog |
| `js/format.js` | `Intl` number, currency and date formatting |
| `data/mock-data.json` | Generated mock data (3 years of shipments, 642 products) |
| `scripts/generate-data.js` | Seeded mock data generator (Node, no dependencies) |
| `tests/run-tests.mjs` | Node tests |
| `tests/tests.html` | Browser tests |
| `assets/` | Kivo logo (`logo.svg`, `logo-icon.svg` favicon, `logo.png`) |
| `SPEC.md` | The project spec |
| `Practice.md` | How we work: 4-step workflow and git rules |
| `CLAUDE.md` | Loads Practice.md and the project skills for Claude Code |
| `.claude/skills/` | Project skills (ui-ux-design) |
| `dashboard-project-starter.md` | The original course brief |
