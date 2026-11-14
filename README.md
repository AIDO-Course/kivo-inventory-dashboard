<img src="assets/logo.svg" alt="Kivo" height="40">

# Kivo: Inventory & Logistics Dashboard

A desktop-first dashboard for **Kivo**, a fictional US wholesale distributor of office supplies and electronics with warehouses in Columbus OH, Reno NV and Atlanta GA. It answers three questions at a glance: what is about to run out, which shipments are late, and how much stock value Kivo holds and where. It is a read-only decision aid for the operations manager, warehouse supervisors and buyers.

**Status:** v1 + Exercise 4. The dashboard reads its data **only from an Airtable database**, through a small local server (`node server.mjs`). There is no static data file. GitHub Pages can't run the server, so the live link shows the load-error state; run it locally to see the data. All numbers are frozen at Nov 7, 2026, 8:00 AM ET.

**Live:** https://aido-course.github.io/kivo-inventory-dashboard/ (no data there: see [How to run it](#how-to-run-it-data-from-airtable))

**Spec:** [SPEC.md](SPEC.md) is the source of truth. The dashboard is built from it.

## Features (v1)

- **7 KPI tiles:** SKUs, stock value (with month-over-month change), low stock, out of stock, in transit, late shipments and on-time %.
- **Warehouse switcher:** All, Columbus OH, Reno NV or Atlanta GA. It updates every number on the page and is kept in the URL (`#wh=RNO`).
- **Alerts strip and low-stock alerts panel:** out of stock first, then low. Each one links into the filtered inventory table.
- **Inventory table:** search by SKU or name, filter by category, warehouse and status, sort any column, 25 rows per page.
- **Shipments list:** inbound and outbound shipments, late ones first with "(N days late)", filtered by direction and status.
- **Stock value chart:** by category or by warehouse, in hand-built SVG, with a click/keyboard tooltip, a text summary and a "Show as table" view.
- **Row-detail dialog:** every field of a SKU or shipment, including the columns hidden on smaller screens.
- **"Data as of" caption** with a *Live · Airtable* badge, plus loading, empty and error states.
- **Warehouse weather** (bonus, external API): current weather for Columbus, Reno and Atlanta from OpenWeatherMap, with a "may delay shipments" warning for storms, snow, heavy rain or strong wind. The header menu has a **Warehouse weather** link that jumps to it.
- **Responsive and accessible:** phone, tablet and desktop. All text meets AA contrast, touch targets are at least 44 px, keyboard navigation works, and reduced motion is respected.

## Not built yet

- 30-day stock movement trend (Should, v1.1)
- CSV export of the inventory table (Should, v1.1)
- On-time % per carrier (Should, v1.1)
- Real WMS/ERP data, reorder suggestions, supplier performance and PWA install (Later)

## Live site

https://aido-course.github.io/kivo-inventory-dashboard/ (GitHub Pages, from `main`). Pages only hosts static files and can't run `server.mjs`, so this link shows the "Couldn't load dashboard data" state. To see the data, run it locally (below).

## How to run it (data from Airtable)

The data lives in an Airtable base called **Kivo** (tables `Meta`, `Warehouses`, `Products`, `Shipments`, `StockHistory`). A small Node server reads it with the Airtable API and serves it to the dashboard at `/api/data`. The token stays on the server and never reaches the browser. Details: [SPEC.md §7.5](SPEC.md).

```
browser ──GET /api/data──▶ server.mjs ──Airtable API + token from .env──▶ Airtable base "Kivo"
```

### What you need

- **Node.js 18 or newer** (`node --version`). No `npm install`: there are no dependencies.
- **An Airtable account** (the free plan is enough).

### 1. Get the code

```bash
git clone https://github.com/AIDO-Course/kivo-inventory-dashboard.git
```

```bash
cd kivo-inventory-dashboard
```

All the commands below run from this folder. If you see `Cannot find module ...server.mjs`, you are in the wrong folder.

### 2. Create the base and the token in Airtable

1. On https://airtable.com, click **Create** → **Build an app on your own** (or **Blank base**) and name the base **Kivo**. Leave it empty; the seed creates the tables.
2. Copy the base ID from the address bar: the part that starts with `app`, e.g. `https://airtable.com/`**`appXXXXXXXXXXXXXX`**`/tbl…`.
3. Go to https://airtable.com/create/tokens → **Create token**:
   - Name: `kivo-dashboard`
   - Scopes: `data.records:read`, `data.records:write`, `schema.bases:read`, `schema.bases:write`
   - Access: the **Kivo** base only
4. Copy the token (it starts with `pat` and is shown only once). Treat it like a password: never put it in code, a chat or a screenshot.

### 3. Put the keys in `.env`

For the weather panel, also get a free OpenWeatherMap key: sign up at https://home.openweathermap.org/users/sign_up and copy the key from https://home.openweathermap.org/api_keys (a new key can take up to 2 hours to start working).

Copy `.env.example` to a new file named `.env` in the project folder and fill in the values:

```
AIRTABLE_TOKEN=pat...
AIRTABLE_BASE_ID=app...
OPENWEATHER_API_KEY=...
```

Without `OPENWEATHER_API_KEY` (or while it is not active yet) the dashboard still works; only the weather panel says "Weather unavailable".

`.env` is in `.gitignore`, so it is never committed. (If you paste the whole base URL, the scripts still pick out the `app…` ID.)

### 4. Load the data into Airtable (once)

```bash
node scripts/seed-airtable.mjs
```

It creates the five tables and prints, for each one, how many records were sent and how many are now in Airtable. Every line should say `OK`, with **991** records in total. It is safe to run again: it updates existing records and removes stale ones, so nothing is doubled.

### 5. Start the server

```bash
node server.mjs
```

You should see `Kivo dashboard on http://localhost:8765 (data from Airtable base app…)`. Open **http://localhost:8765**. Keep this terminal open while you use the dashboard; press `Ctrl+C` to stop it. If port 8765 is busy, start it on another port: `PORT=8080 node server.mjs` (PowerShell: `$env:PORT=8080; node server.mjs`).

### 6. Check that the data comes from Airtable

- The header badge says **Live · Airtable** and the **SKUs** tile shows **250**, the number of records in the Products table.
- http://localhost:8765/api/data shows the raw JSON the server built from Airtable (`"source":"airtable"`).
- http://localhost:8765/api/weather shows the weather the server got from OpenWeatherMap.
- Change a product's `qty_CMH` to `0` in Airtable, wait about a minute (the server reads Airtable at most once a minute) and refresh: the **Out of stock** count goes up by one.

### If something goes wrong

| What you see | Why | Fix |
|---|---|---|
| `Cannot find module '...server.mjs'` | The command ran outside the project folder | `cd` into the project folder first |
| `Set AIRTABLE_TOKEN and AIRTABLE_BASE_ID in .env` | `.env` is missing or a value is empty | Create `.env` from `.env.example` (step 3) |
| `Airtable ... -> 401` or `403` | Wrong token, or missing scopes | Check the token and its scopes (step 2) |
| `Airtable ... -> 404 NOT_FOUND` | Wrong base ID, or the token has no access to the base | Fix `AIRTABLE_BASE_ID`; add the Kivo base to the token's access list |
| Weather panel says "Weather unavailable" | `OPENWEATHER_API_KEY` missing, wrong, or not active yet (the server terminal shows `OpenWeatherMap 401`) | Check the key in `.env`; a new key can take up to 2 hours |
| Page says "Couldn't load dashboard data" | The server is not running, or it can't read Airtable | Start `node server.mjs` and read the error in its terminal |

### About the data

The free Airtable plan allows about 1,000 records per base, so the base holds a subset: 250 products (all low and out-of-stock ones included), 700 shipments (all in transit, the next 100 scheduled, and a sample of recent deliveries) and 37 monthly history snapshots. The seed takes its input from `scripts/generate-data.js` (seeded, so it is the same every time). It prints JSON and writes no file.

## Tests

Node tests check the metric formulas, the generated data rules, the Airtable mapping, the palette and that no frameworks are used:

```bash
node tests/run-tests.mjs
```

Browser tests check filters, sorting, the warehouse switch, the dialog, states, touch targets and no horizontal scroll at 320 to 1440 px. With `node server.mjs` running, open http://localhost:8765/tests/tests.html. Their expected numbers are computed from the same Airtable data.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The single page: header, overview, inventory, shipments, dialog |
| `css/styles.css` | All styles, in `@layer`s, with every design token as a CSS variable |
| `js/main.js` | Entry point: loads data, wires controls, renders on state change |
| `js/data.js` | Loads data from `api/data` (Airtable only, no fallback) and validates it |
| `js/weather.js` | Warehouse weather: maps the OpenWeatherMap response, decides "may delay shipments", renders the panel |
| `js/airtable-map.js` | Converts the data set to Airtable records and back; picks the free-plan subset |
| `js/state.js` | App state with subscribe/notify, and the `#wh=` URL hash |
| `js/metrics.js` | Pure functions for every metric formula in SPEC.md §7.1 |
| `js/kpis.js` | KPI tiles and count-up |
| `js/chart.js` | Stock value bar chart (inline SVG) and its table view |
| `js/tables.js` | Inventory and shipments tables: filter, sort, page |
| `js/dialog.js` | Row-detail dialog |
| `js/format.js` | `Intl` number, currency and date formatting |
| `scripts/generate-data.js` | Seeded data generator, input for the Airtable seed and the tests (prints JSON) |
| `scripts/seed-airtable.mjs` | Creates the Airtable tables, upserts the data subset, deletes stale records |
| `scripts/airtable.mjs` | Tiny Airtable API client; reads the token from `.env` |
| `server.mjs` | Local server: serves the site, `GET /api/data` from Airtable and `GET /api/weather` from OpenWeatherMap |
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
