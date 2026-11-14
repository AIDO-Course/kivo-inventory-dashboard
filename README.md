<img src="assets/logo.svg" alt="Kivo" height="40">

# Kivo: Inventory & Logistics Dashboard

A desktop-first dashboard for **Kivo**, a fictional US wholesale distributor of office supplies and electronics with warehouses in Columbus OH, Reno NV and Atlanta GA. It answers three questions at a glance: what is about to run out, which shipments are late, and how much stock value Kivo holds and where. It is a read-only decision aid for the operations manager, warehouse supervisors and buyers.

**Status:** v1 + Exercise 4. Run locally with `node server.mjs`, the dashboard reads its data from an **Airtable** database (badge: *Live · Airtable*). On GitHub Pages there is no server, so it falls back to the mock JSON (badge: *Mock data*). All numbers are frozen at Nov 7, 2026, 8:00 AM ET.

**Live:** https://aido-course.github.io/kivo-inventory-dashboard/

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

**Live:** https://aido-course.github.io/kivo-inventory-dashboard/ (GitHub Pages, from the `main` branch root)

## Data from Airtable (Exercise 4)

The data lives in an Airtable base called **Kivo** (tables `Meta`, `Warehouses`, `Products`, `Shipments`, `StockHistory`). A small Node server reads it with the Airtable API and gives the dashboard the same JSON shape it always used. The token stays on the server. Details: [SPEC.md §7.5](SPEC.md).

```
browser ──GET /api/data──▶ server.mjs ──Airtable API + token from .env──▶ Airtable base "Kivo"
```

1. In Airtable, create an empty base named `Kivo`, and a personal access token (https://airtable.com/create/tokens) with access to that base only and the scopes `data.records:read`, `data.records:write`, `schema.bases:read` and `schema.bases:write`.
2. Copy `.env.example` to `.env` and fill in `AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID` (the `app…` part of the base URL). `.env` is git-ignored and never committed.
3. Load the data once (safe to run again, it upserts and never doubles records):

   ```bash
   node scripts/seed-airtable.mjs
   ```

4. Start the server and open http://localhost:8765:

   ```bash
   node server.mjs
   ```

The free Airtable plan allows about 1,000 records per base, so the base holds a subset: 250 products (all low and out-of-stock ones included), 700 shipments (open ones first) and 37 monthly history snapshots.

## Run it locally (mock data only)

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
| `js/data.js` | Loads data from `api/data` (Airtable), falling back to `data/mock-data.json`, and validates it |
| `js/airtable-map.js` | Converts the data set to Airtable records and back; picks the free-plan subset |
| `js/state.js` | App state with subscribe/notify, and the `#wh=` URL hash |
| `js/metrics.js` | Pure functions for every metric formula in SPEC.md §7.1 |
| `js/kpis.js` | KPI tiles and count-up |
| `js/chart.js` | Stock value bar chart (inline SVG) and its table view |
| `js/tables.js` | Inventory and shipments tables: filter, sort, page |
| `js/dialog.js` | Row-detail dialog |
| `js/format.js` | `Intl` number, currency and date formatting |
| `data/mock-data.json` | Generated mock data (3 years of shipments, 642 products) |
| `scripts/generate-data.js` | Seeded mock data generator (Node, no dependencies) |
| `scripts/seed-airtable.mjs` | Creates the Airtable tables and upserts the data subset |
| `scripts/airtable.mjs` | Tiny Airtable API client; reads the token from `.env` |
| `server.mjs` | Local server: serves the site and `GET /api/data` from Airtable |
| `.env.example` | Template for `.env` (names only, no secret values) |
| `tests/run-tests.mjs` | Node tests |
| `tests/tests.html` | Browser tests |
| `assets/` | Kivo logo (`logo.svg`, `logo-icon.svg` favicon, `logo.png`) |
| `SPEC.md` | The project spec |
| `Practice.md` | How we work: 4-step workflow and git rules |
| `CLAUDE.md` | Loads Practice.md and the project skills for Claude Code |
| `.claude/skills/` | Project skills (ui-ux-design) |
| `dashboard-project-starter.md` | The original course brief |
| `SESSION-EXPORT.md` | Full export of the Claude Code session that built this project |
