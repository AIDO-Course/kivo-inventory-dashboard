# Kivo: Inventory & Logistics Dashboard

**Kivo** is a US wholesale distributor of office supplies and electronics. It stocks about 640 products in three warehouses and ships them to business customers (schools, offices, resellers). This dashboard gives Kivo's operations team one desktop-first screen with the state of stock and shipments. It runs on **mock data only**, frozen at a fixed point in time.

At a glance, it answers three questions:

1. **What is about to run out?** Products at or below their reorder point, and products already at zero.
2. **Which shipments are late?** Inbound and outbound shipments past their ETA.
3. **How much stock value do we hold, and where?** Total value, split by category and warehouse.

> Status: this is the spec, written **before any code**. The dashboard is built from it and must match it exactly. Anything not described here is out of scope.

---

## 0. Design principles

| # | Principle | What it means in practice |
|---|-----------|---------------------------|
| 1 | **Desktop-first** | Designed at 1440 px for the morning review at a desk. Tablet (the warehouse floor) and phone only re-flow the same content. Nothing is hidden on smaller screens. |
| 2 | **Glanceable** | Reading order is fixed: alerts strip → KPI row → chart → tables. The three questions above are answered **above the fold at 1440 × 900** without scrolling. |
| 3 | **Problems first** | Things that need action (out of stock, low stock, late) sort to the top by default and are the only things allowed to use status colours. |
| 4 | **Big touch targets** | Every interactive element is at least **44 × 44 px**, with at least **8 px** between targets. Supervisors use a tablet, often wearing gloves. |
| 5 | **Brand-led, calm** | Kivo Teal and Crate Amber from the logo set the tone. Neutral greys carry the structure. Status colours are kept for status. |
| 6 | **Colour is never the only signal** | Every status shows a **word and an icon**, and every trend shows an **arrow and a +/− sign**. The screen works in greyscale. |

---

## 1. Who

| Role | Context | Needs to |
|------|---------|----------|
| **Operations manager** (primary) | At a desk in the Columbus office, 24" monitor (1440–1920 px wide), 5–10 minutes every morning at 8:00, plus quick checks during the day. | See total stock value, what is running out and what is late across all three warehouses, so they can decide what to escalate before the 9:00 stand-up. |
| **Warehouse supervisor** | On the warehouse floor with a 10" tablet (768–1024 px, held in portrait or landscape), 1–2 minutes at a time, many times per shift. | Filter to *their* warehouse and see which SKUs are low or out, and which inbound trucks are late, so they can plan picking and receiving. |
| **Buyer** | At a desk, laptop (1280–1440 px), 15–30 minutes, two or three times a week. | Find every SKU at or below its reorder point, with supplier and quantity, so they can raise purchase orders **in Kivo's purchasing system** (not here). |

**Not users:** customers, suppliers, carriers and drivers, the finance team, and the public. None of them sees this screen. Nothing in the UI is written for them.

---

## 2. What it is / What it is not

**IT IS:** a read-only, single-page dashboard that shows Kivo's inventory and shipment status from a fixed mock data set. Users can filter, search, sort and switch views. The page never changes the data. It is a decision aid for the morning review and for on-floor checks.

**IT IS NOT:**

- ❌ No login, user accounts, roles or permissions. Everyone sees the same screen.
- ❌ No real database, API, backend or live data feed. All numbers come from `data/mock-data.json`.
- ❌ No editing of any data: no changing quantities, reorder points, prices, statuses or ETAs.
- ❌ **Not a purchasing system:** no placing, approving or sending purchase orders. No "Order" or "Reorder" button that pretends to buy anything.
- ❌ Not a warehouse management system (WMS): no bin locations, pick lists, barcode scanning or stock transfers.
- ❌ No shipment tracking with carriers and no maps or live GPS.
- ❌ No sending of emails, SMS, push notifications or chat messages.
- ❌ No customer orders, invoices, prices charged to customers, revenue or profit figures.
- ❌ No supplier contacts or supplier scorecards (supplier performance is listed under Later).
- ❌ No dark mode in v1.
- ❌ No languages other than US English. No right-to-left layout.
- ❌ No real company names, real people, real addresses or real phone numbers anywhere.
- ❌ No user settings saved on a server. Filters reset on reload (see §8).
- ❌ No printing layout, PDF export or scheduled reports.

---

## 3. Where

- **Platform:** a static single-page web app hosted on **GitHub Pages**. It uses plain modern web standards: HTML5, modern CSS and vanilla JavaScript (ES2022+, ES modules).
  - **No frameworks:** no React, Angular, Vue, Svelte or jQuery.
  - **No CSS frameworks:** no Bootstrap or Tailwind.
  - **No build step.**
  - The design must still be polished, professional and modern.
- **Approach:** desktop-first. The primary target is 1440 × 900. It is also supported on tablet (iPad-class, 768–1023 px) and phone (360–599 px).
- **Browsers:** latest 2 versions of Chrome, Edge, Firefox and Safari.
- **Breakpoints:** `< 600 px` phone · `600–1023 px` tablet · `≥ 1024 px` desktop. There is **no horizontal page scroll anywhere from 320 px to 1440 px**. Wide tables scroll inside their own card, never the page.

### Responsive behaviour

| | Phone `< 600 px` | Tablet `600–1023 px` | Desktop `≥ 1024 px` |
|---|---|---|---|
| Page padding | 16 px | 24 px | 32 px |
| Max content width | 100% | 100% | **1360 px**, centred |
| Navigation | Section tabs in a sticky bar under the header, horizontally scrollable *inside the bar* | Same as phone | Section links in the header, right of the logo |
| Warehouse switcher | Full-width select under the header | In the header, right side | In the header, right side |
| KPI tiles per row | 2 (7 tiles → 4 rows, last tile spans 2 columns) | 4 (2 rows) | 7 (1 row; at 1024–1279 px: 4 + 3) |
| Alerts strip | Full width, stacked | Full width | Full width |
| Chart + Alerts panel | Stacked: chart, then alerts | Stacked | Side by side: chart 8 of 12 columns, Low-stock alerts 4 of 12 |
| Inventory table | Card list (one card per SKU: name, SKU, status, qty / reorder point, warehouse) | Table with 6 columns: Status, Product, SKU, Warehouse, Qty on hand, Reorder point (Category, Unit cost and Stock value hidden; shown in the row-detail dialog, with Supplier and Lead time) | Full table, 9 columns |
| Shipments table | Card list | Table, 6 columns (Ship date and Carrier hidden; in the row-detail dialog) | Full table, 8 columns |
| Long text | Product names truncate with an ellipsis after **1 line** in tables and **2 lines** in cards. The full name is in the `title` attribute and in the row-detail dialog. | Same | Same |

"Nothing hidden": a column dropped at a smaller breakpoint is always reachable in the row-detail dialog (§6.7).

---

## 4. Features

### Must (v1)

| ID | Feature |
|----|---------|
| M1 | As an **operations manager**, I can see **7 KPI tiles**: SKUs, stock value, low stock, out of stock, in transit, late shipments and on-time %. This way I know the state of the business in 5 seconds. |
| M2 | As a **warehouse supervisor**, I can switch between **All warehouses / Columbus OH / Reno NV / Atlanta GA**, and every tile, chart, list and table updates to that warehouse. This way I see only my site. |
| M3 | As a **buyer**, I can see a **Low-stock alerts** list of every SKU at or below its reorder point, out-of-stock first. This way I know what to reorder. |
| M4 | As an **operations manager**, I can browse an **Inventory table**: search by SKU or name, filter by category, warehouse and status, and sort by any column. This way I can find any product in seconds. |
| M5 | As a **warehouse supervisor**, I can browse a **Shipments list** with direction (inbound/outbound), status and ETA, filtered by status and direction and sorted by ETA. Late shipments sort first by default. This way I can plan receiving and chase late trucks. |
| M6 | As an **operations manager**, I can see a **Stock value chart**, switchable between **by category** and **by warehouse**. This way I see where our money sits. |
| M7 | As any user, I can open a **row-detail dialog** for any SKU or shipment and see every field, including fields hidden on small screens. |
| M8 | As any user, I can see **"Data as of Nov 7, 2026, 8:00 AM ET · Mock data"** in the header, so I never mistake this for live numbers. |

### Should (v1.1, NOT built in v1)

| ID | Feature |
|----|---------|
| S1 | As an **operations manager**, I can see a **30-day stock movement trend** (units received vs shipped per day), so I can spot unusual drops. |
| S2 | As a **buyer**, I can **export the current filtered inventory table as CSV**, so I can paste it into the purchasing system. |
| S3 | As an **operations manager**, I can see **on-time % per carrier for the last 12 months**, so I can compare carriers. |

### Later (not planned)

| ID | Feature |
|----|---------|
| L1 | As an **operations manager**, I can see **real WMS/ERP data** instead of mock data. |
| L2 | As a **buyer**, I get **reorder quantity suggestions** based on 90-day demand. |
| L3 | As a **buyer**, I can see **supplier performance** (lead time, fill rate). |
| L4 | As a **warehouse supervisor**, I can **install the dashboard as a PWA** on the tablet. |

---

## 5. Design rules

### 5.1 Brand assets / logo

- **Files:**
  - `assets/logo.svg`: full logo (icon + "kivo" wordmark), viewBox 220 × 64.
  - `assets/logo-icon.svg`: icon only, square, 64 × 64.
  - `assets/logo.png`: 512 × 512 raster, transparent.
- **Header:** `logo.svg` at **40 px height** (≈ 138 px wide), left-aligned, on the **White** header background. The logo must never sit on a teal, amber or status-colour fill.
- **Favicon:** `logo-icon.svg` (`<link rel="icon" type="image/svg+xml">`), with `logo.png` as `apple-touch-icon`.
- **Clear space:** at least **12 px** on every side (≈ ¼ of the logo height).
- **Minimum size:** 32 px tall for the full logo and 16 px for the icon.
- **Don'ts:** no recolouring, stretching, rotating, shadows, outlines or animation. Don't re-type the wordmark in another font. Don't put the logo on a photo or a pattern.

### 5.2 Palette

The two brand colours come from the logo. Kivo Teal is the main colour and Crate Amber is the one complementary accent (warm against cool). Neutrals are teal-tinted greys. Status colours are reserved.

| Token | HEX | Role |
|-------|-----|------|
| `--teal-700` | `#0B5563` | **Kivo Teal.** Primary buttons, links, selected tab/chip fill, chart series 1, focus ring. |
| `--teal-800` | `#08414C` | Primary button hover/pressed. |
| `--teal-50` | `#E7F0F2` | Selected row, selected chip background, skeleton loaders. |
| `--amber-500` | `#F2A541` | **Crate Amber.** Chart series 2, "Low" status icon, today marker. **Never used as text, and never as a background for white text.** |
| `--amber-800` | `#8A5A12` | Text form of amber: "Low stock" status label. |
| `--amber-50` | `#FDF1DE` | "Low stock" badge background, warning banner background. |
| `--indigo-600` | `#4A4FC4` | Chart series 3 only (third warehouse, third category). |
| `--green-700` | `#24693F` | "In stock", "Delivered", "On time" status text/icon. Positive trend. |
| `--green-50` | `#E6F2EA` | Positive status badge background. |
| `--red-700` | `#B42318` | "Out of stock", "Late" status text/icon. Error banner text, and the late ETA text in the shipments table. |
| `--red-800` | `#8F1D13` | Danger button hover (reserved; there is no danger action in v1). |
| `--red-50` | `#FDECEA` | Negative status badge background, error banner background. |
| `--ink-900` | `#14262B` | Body text, headings, KPI values. |
| `--ink-600` | `#4A5F66` | Secondary text: labels, captions, table headers, axis labels. |
| `--line-200` | `#D5E0E3` | Borders, dividers, gridlines, inactive chip borders. |
| `--page-50` | `#F4F7F8` | **Page background.** |
| `--white` | `#FFFFFF` | Cards, header, table rows, dialog. |

Only these 17 colours (plus transparency of `--ink-900` for shadows, §5.5) may appear in CSS, SVG and JS.

Chart series for 4+ categories use, in order: `--teal-700`, `--amber-500`, `--indigo-600`, `--ink-600`, `--line-200` with a `--ink-600` 1 px outline. They are told apart by hue, and the last two by lightness *and* outline, always backed by a labelled legend.

#### Contrast (WCAG 2.1, measured)

| Text / foreground | Background | Ratio | AA result | Use |
|---|---|---|---|---|
| Ink 900 `#14262B` | Page 50 `#F4F7F8` | **14.54 : 1** | Pass | Body text on page |
| Ink 900 | White | **15.65 : 1** | Pass | Text in cards |
| Ink 900 | Teal 50 `#E7F0F2` | **13.52 : 1** | Pass | Selected row text |
| Ink 900 | Amber 50 `#FDF1DE` | **14.02 : 1** | Pass | Warning banner text |
| Ink 900 | Amber 500 `#F2A541` | **7.63 : 1** | Pass | Text on amber chart labels (if any) |
| Ink 600 `#4A5F66` | White | **6.73 : 1** | Pass | Labels, captions |
| Ink 600 | Page 50 | **6.25 : 1** | Pass | Captions on page |
| Ink 600 | Teal 50 | **5.82 : 1** | Pass | Captions in selected row |
| Teal 700 `#0B5563` | White | **8.42 : 1** | Pass | Links, ghost buttons |
| Teal 700 | Page 50 | **7.82 : 1** | Pass | Links on page |
| Teal 700 | Teal 50 | **7.28 : 1** | Pass | Selected chip label |
| White | Teal 700 | **8.42 : 1** | Pass | Primary button label |
| White | Teal 800 `#08414C` | **11.23 : 1** | Pass | Primary button hover |
| Amber 800 `#8A5A12` | Amber 50 | **5.30 : 1** | Pass | "Low" badge |
| Amber 800 | White | **5.91 : 1** | Pass | "Low" label in table |
| Green 700 `#24693F` | Green 50 `#E6F2EA` | **5.76 : 1** | Pass | "In stock"/"Delivered" badge |
| Green 700 | White | **6.63 : 1** | Pass | Positive trend |
| Red 700 `#B42318` | Red 50 `#FDECEA` | **5.75 : 1** | Pass | "Out"/"Late" badge, error banner |
| Red 700 | White | **6.57 : 1** | Pass | Late ETA text in the shipments table |
| Indigo 600 `#4A4FC4` | White | **6.55 : 1** | Pass | Legend label (if coloured) |
| ~~White~~ | ~~Amber 500~~ | 2.05 : 1 | **Fail. Forbidden.** | Never put white text on amber |
| ~~Amber 500~~ | ~~White~~ | 2.05 : 1 | **Fail. Forbidden.** | Never use amber as text |

UI graphics need 3 : 1 against their background (WCAG 1.4.11). The focus ring (Teal 700) on White is 8.42 : 1, and Amber 500 chart bars sit on White with a 1 px `--amber-800` top edge.

### 5.3 Colour rules

1. **Red (`--red-700`, `--red-50`) is used ONLY for "Out of stock", "Late" and the error banner.** Never for decoration, headers, buttons or chart series.
2. **Green is used ONLY for "In stock", "Delivered", "On time" and positive trends.**
3. **Amber in the UI chrome means "Low stock / warning" only.** In charts it is series 2.
4. Status is **never colour alone**:
   - Out of stock = ⛔ icon + the word "Out"
   - Low = ⚠ + "Low"
   - In stock = ✓ + "In stock"
   - Late = ⏱ + "Late"
   - In transit = 🚚 + "In transit"
   - Delivered = ✓ + "Delivered"
   - Scheduled = 📅 + "Scheduled"

   All icons are inline SVG (§5.6), not emoji. The emoji above only describe the shape.
5. No gradients, no colours outside §5.2, and no pure black (`#000`).

### 5.4 Typography

- **Family:** **Inter** (Google Fonts, weights 400, 500, 600 and 700, `display=swap`), falling back to `system-ui, "Segoe UI", Roboto, Arial, sans-serif`.
- **Tabular numerals** (`font-variant-numeric: tabular-nums`) for every number.

| Text | Size (desktop) | Size (phone) | Weight | Line height |
|---|---|---|---|---|
| KPI value | 32 px | 28 px | 700 | 1.1 |
| Page title (h1, "Inventory & Logistics") | 24 px | 20 px | 700 | 1.2 |
| Section title (h2) | 20 px | 18 px | 600 | 1.3 |
| Body / table cell | 16 px | 16 px | 400 | 1.5 |
| Label (KPI label, table header, chip) | 14 px | 14 px | 500 (headers 600, uppercase off) | 1.4 |
| Caption (minimum size) | **13 px** | **13 px** | 400 | 1.4 |

Nothing is smaller than 13 px. Sizes use `clamp()` between the phone and desktop values.

### 5.5 Sizes and shape

- **Touch target:** minimum **44 × 44 px** for every button, chip, link-in-table, tab, select and table row action.
- **Buttons:** 44 px tall (primary/secondary/ghost), with 16 px horizontal padding and a minimum width of 96 px.
- **Icons:** 20 px inline (in badges, buttons and table cells) and 24 px in KPI tiles, always with a visible text label next to them.
- **Radius:** cards **12 px**, buttons and inputs **8 px**, badges and chips **999 px**, dialog **16 px**.
- **Borders:** 1 px `--line-200` on cards, inputs and the table outer edge. Row dividers are 1 px `--line-200`.
- **Shadow (cards):** `0 1px 2px rgba(20,38,43,.06), 0 2px 8px rgba(20,38,43,.06)`. This is the only shadow, and the dialog uses it doubled.
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48 px (`--space-1` … `--space-7`). No other spacing values.
- **Grid gap:** 16 px phone, 24 px tablet and desktop.
- **Table row height:** 48 px (desktop), 56 px (tablet).

### 5.6 Icons

Hand-made inline SVG icons in a single `<svg>` sprite, 24 × 24 viewBox, 2 px stroke, `currentColor`. There are no icon fonts and no external icon CDN. Every icon has a visible text label. Decorative icons get `aria-hidden="true"`.

### 5.7 Main screen layout (desktop, 1440 px)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [kivo logo 40px]  Overview · Inventory · Shipments    Data as of Nov 7, 2026, 8:00 AM ET │
│                                                        · Mock data   [Warehouse: All ▾] │  ← Header, white, sticky, 72px
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ⛔ 9 SKUs out of stock · ⚠ 31 low · ⏱ 14 shipments late          [View alerts →]     │  ← Alerts strip (only if any)
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────┐┌──────────┐┌────────┐┌────────┐┌──────────┐┌────────┐┌──────────┐          │
│ │SKUs    ││Stock val.││Low     ││Out of  ││In transit││Late    ││On-time % │          │  ← 7 KPI tiles, 1 row
│ │  642   ││ $4.82M   ││ ⚠ 31   ││ ⛔ 9   ││  🚚 58   ││ ⏱ 14   ││  91.4 %  │          │
│ │        ││▲ 2.1% MoM││        ││        ││          ││        ││▼ 1.2 pts │          │
│ └────────┘└──────────┘└────────┘└────────┘└──────────┘└────────┘└──────────┘          │
│ ┌───────────────────────────────────────────────┐ ┌──────────────────────────────┐    │
│ │ Stock value  [By category | By warehouse]     │ │ Low-stock alerts (40)        │    │
│ │                                               │ │ ⛔ Out  Toner cartridge K-26  │    │
│ │  Paper & Stationery    ███████████  $1.21M    │ │        0 / 40 · Reno         │    │
│ │  Printer Supplies      █████████    $1.02M    │ │ ⚠ Low  USB-C Hub 7-port      │    │
│ │  Computer Peripherals  ████████     $0.96M    │ │        12 / 30 · Columbus    │    │
│ │  Cables & Networking   ████         $0.48M    │ │ …                            │    │
│ │  Office Furniture      ██████████   $1.15M    │ │ [See all in inventory →]     │    │
│ │  [Show as table]   Summary: Paper & Stat… lead│ └──────────────────────────────┘    │
│ └───────────────────────────────────────────────┘                                     │
│ Inventory (642)                                                                         │
│ [🔍 Search SKU or name      ] [Category ▾] [Warehouse ▾] [Status ▾]   [Clear filters]  │
│ ┌────────┬──────────────────────┬──────────┬───────────┬─────┬───────┬────────┬──────┐ │
│ │Status  │Product               │SKU       │Category   │Qty  │Reorder│Unit $  │Value │ │
│ │⛔ Out  │Toner cartridge K-26 │PRN-0412  │Printer…   │   0 │   40  │ 58.00  │ 0.00 │ │
│ │⚠ Low   │USB-C Hub 7-port      │PER-0218  │Peripher…  │  12 │   30  │ 21.40  │256.80│ │
│ └────────┴──────────────────────┴──────────┴───────────┴─────┴───────┴────────┴──────┘ │
│  Showing 1–25 of 642     [‹ Prev] [1] [2] [3] … [26] [Next ›]                         │
│ Shipments (312 open)                                                                    │
│ [Direction: All|Inbound|Outbound] [Status ▾]                                           │
│ ┌────────┬────────┬─────────┬─────────────────┬──────────┬──────────┬────────┬───────┐ │
│ │Status  │ID      │Direction│Origin → Dest.   │Ship date │ETA       │Carrier │Items  │ │
│ │⏱ Late  │SH-48211│Inbound  │Supplier → Reno  │Oct 29    │Nov 3     │Ridgeway│ 14    │ │
│ └────────┴────────┴─────────┴─────────────────┴──────────┴──────────┴────────┴───────┘ │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

The warehouse switcher (M2) is a header-level control that changes **every** number on the page. The table filters (category, warehouse, status) only change their own table. If the header switcher is set to a warehouse, the inventory table's Warehouse filter is locked to that value and shows "(set in header)".

---

## 6. Components

### 6.1 Header
- **Look:** White background, 72 px tall (desktop), with a 1 px `--line-200` bottom border, sticky at the top.
- **Contents, left to right:**
  - logo (40 px)
  - section links "Overview · Inventory · Shipments" (anchor links, 44 px tall, 16 px, `--ink-600`; the active one is `--teal-700` with a 3 px `--teal-700` bottom bar, set by IntersectionObserver)
  - "Data as of …" caption (13 px, `--ink-600`), with a "Mock data" badge (`--teal-50` background, `--teal-700` text)
  - warehouse switcher: a native `<select>`, 44 px tall, minimum width 200 px, label "Warehouse"
- **Phone:** logo and data caption on row 1, switcher full width on row 2, and section tabs in a sticky bar on row 3.

### 6.2 Alerts strip
- **Visibility:** shown only when out-of-stock + low + late > 0.
- **Look:** `--amber-50` background, `--line-200` border, 12 px radius, 16 px padding.
- **Contents:** three counts, each an icon + number + word in its status colour (red for Out and Late, amber-800 for Low). The counts are buttons:
  - "⛔ 9 out of stock" sets the inventory Status filter to Out and scrolls to the table.
  - "⚠ 31 low" sets it to Low and scrolls to the table.
  - "⏱ 14 late" sets the shipment Status filter to Late and scrolls to that table.
- **Phone:** the three buttons stack, each full width, 44 px.

### 6.3 KPI tiles (M1)
- **Look:** White card, 12 px radius, 16 px padding, minimum height 112 px.
- **Contents, top to bottom:** label (14 px, `--ink-600`), value (32 px, 700, `--ink-900`), then an optional delta line (13 px).
- **The 7 tiles, in this order:**

| # | Label | Value format | Delta line | Icon |
|---|---|---|---|---|
| 1 | SKUs | `642` (integer) | none | box |
| 2 | Stock value | `$4.82M` (compact USD, 2 decimals) | "▲ 2.1% vs Oct 7" (MoM) | dollar |
| 3 | Low stock | `31` | "SKUs at or below reorder point" | ⚠ in `--amber-500`, value `--ink-900` |
| 4 | Out of stock | `9` | "SKUs with 0 on hand" | ⛔ in `--red-700` |
| 5 | In transit | `58` | "shipments on the road" | truck |
| 6 | Late | `14` | "open shipments past ETA" | ⏱ in `--red-700` |
| 7 | On-time % | `91.4%` (1 decimal) | "▼ 1.2 pts vs prior 30 days" | check |

- **Delta colours:** ▲ = `--green-700` and ▼ = `--ink-900` (never red: red is reserved for Out, Late and errors, §5.3). The arrow and sign are always shown. For stock value, no colour judgement is made: the delta is `--ink-600` with the arrow only.
- **Clicking:** tiles 3, 4 and 6 are buttons (whole tile, `cursor: pointer`, hover border `--teal-700`) that apply the same filter as the alerts strip. The other tiles are not interactive and get no hover state.

### 6.4 Filters (inventory table)
- **Search:** text input, 44 px, minimum width 280 px (100% on phone), with a placeholder "Search SKU or name". It matches SKU or name case-insensitively, as a substring, with a 200 ms debounce.
- **Category / Warehouse / Status:** native `<select>`s, 44 px, each with an "All" option.
  - Status options: All, In stock, Low, Out, Low + Out (the last one is what "See all in inventory →" sets).
- **"Clear filters":** a ghost button, shown only when at least one filter is active.
- **Result count:** the table title shows the count, e.g. "Inventory (31 of 642)".

### 6.5 Inventory table (M4)
- **Markup:** a semantic `<table>` with `<caption>` (visually hidden: "Inventory, filtered") and `<th scope="col">`.
- **Columns (desktop):** Status (badge) · Product · SKU · Category · Warehouse · Qty on hand · Reorder point · Unit cost · Stock value.
  - Numbers are right-aligned.
  - Unit cost and stock value are USD with 2 decimals.
- **Default sort:** Status (Out → Low → In stock), then Qty ÷ Reorder point ascending.
- **Sorting:** clicking a header toggles asc/desc. The header shows ▲/▼ plus `aria-sort`, and only one column sorts at a time.
- **Paging:** 25 rows per page, with Prev / page numbers / Next buttons (44 px).
- **Rows:** hover gives a `--teal-50` background. Clicking a row (or Enter on a focused row) opens the row-detail dialog.
- **Status badge:** a pill with 20 px icon + word, 28 px tall (inside the 48 px row, which is the touch target).

### 6.6 Shipments list (M5)
- **Filters:**
  - Direction: segmented control (All · Inbound · Outbound), 44 px.
  - Status: select with All, Scheduled, In transit, Late, Delivered (last 30 days).
- **Default view:** open shipments plus shipments delivered in the last 30 days.
- **Default sort:** Late first, then ETA ascending.
- **Columns:** Status · Shipment ID · Direction · Origin → Destination · Ship date · ETA · Carrier · Lines (number of SKUs). Dates are formatted "Nov 3, 2026".
- **Late rows:** the ETA cell shows "Nov 3 (4 days late)" in `--red-700`.
- **Paging and row detail:** same as the inventory table.

### 6.7 Row-detail dialog (M7)
- **Element:** a native `<dialog>`, 16 px radius, max width 560 px (full screen on phone), White.
- **Contents:** every field of the record as a definition list. For a SKU, it also lists the open inbound shipments that contain it.
- **Closing:** a "Close" ghost button (44 px) at the top right, Esc, or a click on the backdrop. Focus returns to the row that opened it.
- **No editing:** there are no edit controls of any kind.

### 6.8 Low-stock alerts panel (M3)
- **Look:** a White card titled "Low-stock alerts (N)".
- **List:** up to 8 rows, out-of-stock first, then Low sorted by qty ÷ reorder point ascending. Each row is 56 px with: status badge · product name (1 line, ellipsis) · "12 / 30 on hand · Columbus" (13 px, `--ink-600`).
- **Footer:** a ghost button, "See all in inventory →", that sets the Status filter to "Low + Out" and scrolls to the table.
- **No problems:** if N = 0, the panel shows "✓ Nothing below reorder point." in `--green-700`.

### 6.9 Stock value chart (M6)
- **Type:** hand-built inline SVG, horizontal bar chart. The height is 48 px per bar plus axis.
- **Toggle:** "By category" / "By warehouse", a segmented control (44 px, selected = `--teal-700` fill + white label).
- **Colours:**
  - By category: 5 bars, coloured by the series order in §5.2.
  - By warehouse: 3 bars: Columbus `--teal-700`, Reno `--amber-500`, Atlanta `--indigo-600`.
  - When the header switcher is on one warehouse, "By warehouse" shows that warehouse's bar in its colour and the other two in `--line-200`, labelled "(not selected)".
- **Labels:** the category/warehouse name sits left of the bar (14 px, `--ink-900`) and the value right of the bar (14 px, 600, compact USD).
- **Axis:** an x-axis with at most **4 vertical gridlines** in `--line-200` and axis labels in 13 px `--ink-600`.
- **Tooltip:** shown on **click/tap and keyboard focus** (not hover only). It reads "Printer Supplies: $1,021,480 · 21.2% of total · 128 SKUs" and closes on Esc or a click outside. Each bar is focusable (`tabindex="0"`).
- **Text summary under the chart:** "Paper & Stationery holds the most stock value: $1.21M (25.1%)." This is generated from the data.
- **"Show as table" toggle:** replaces the chart with a `<table>` of the same numbers.

### 6.10 Navigation
Anchor links to `#overview`, `#inventory` and `#shipments`, with smooth scroll (instant under `prefers-reduced-motion`). The header is sticky, so sections get `scroll-margin-top: 88px`.

### 6.11 Buttons

| Type | Height | Fill | Label | Border | Use |
|---|---|---|---|---|---|
| Primary | 44 px | `--teal-700` (hover/pressed `--teal-800`) | `--white`, 14 px 600 | none | One per view at most: "Retry" in the error banner |
| Secondary | 44 px | `--white` | `--teal-700`, 14 px 600 | 1 px `--teal-700` | "Show as table", pagination, segmented-control options |
| Tertiary / ghost | 44 px | transparent (hover `--teal-50`) | `--teal-700`, 14 px 600 | none | "Clear filters", "Close", "See all in inventory →" |
| Danger | 44 px | `--red-700` (hover `--red-800`) | `--white` | none | **Defined but unused in v1.** No destructive actions exist. |

- **Focus ring (all interactive elements):** `outline: 3px solid var(--teal-700); outline-offset: 2px;` on `:focus-visible` only.
- **Pressed:** fill one step darker, plus `transform: scale(0.98)` for 100 ms (skipped under `prefers-reduced-motion`).
- **Disabled:** 40% opacity, `cursor: not-allowed`, and `aria-disabled="true"`. Disabled buttons are still visible.

---

## 7. Data

### 7.1 Metric definitions

All metrics respect the header warehouse switcher. "Today" is the data snapshot time, **2026-11-07 08:00 America/New_York**.

| Metric | Formula |
|---|---|
| SKUs | Count of distinct `sku` in `stock` rows for the selected warehouse(s). A SKU in 2 warehouses counts **once** under "All". |
| Stock value | Σ `stock.qty_on_hand × product.unit_cost` over the selected warehouse(s). |
| Stock value MoM % | `(value_today − value_on_2026-10-07) ÷ value_on_2026-10-07 × 100`, using `stock_history` monthly snapshots. One decimal. |
| Stock status (per stock row) | **Out** if `qty_on_hand = 0`; **Low** if `0 < qty_on_hand ≤ reorder_point`; **In stock** otherwise. |
| Low stock | Count of stock rows with status Low. |
| Out of stock | Count of stock rows with status Out. |
| In transit | Count of shipments with `status = "in_transit"` (late or not). |
| Late (open) | Count of shipments with `status ∈ {scheduled, in_transit}` and `eta < today` (date part). Shown with status "Late" in the UI. |
| Days late | `today − eta` in whole days for open shipments; `delivered_at − eta` for delivered ones. |
| On-time % | `delivered shipments with delivered_at ≤ eta (date part)` ÷ `all shipments delivered in the last 30 days` × 100, one decimal. |
| On-time delta | `on_time_% (last 30 days) − on_time_% (days 31–60)`, shown in percentage **points**. |
| Category / warehouse share | `stock value of group ÷ total stock value × 100`, one decimal. |

### 7.2 Data model

**warehouse**
| Field | Type | Example |
|---|---|---|
| id | string | `"CMH"` |
| name | string | `"Columbus OH"` |
| timezone | string | `"America/New_York"` |

The 3 warehouses are `CMH` Columbus OH (hub, about 45% of stock), `RNO` Reno NV (about 30%) and `ATL` Atlanta GA (about 25%).

**product**
| Field | Type | Notes |
|---|---|---|
| sku | string | `"PRN-0412"`: 3-letter category prefix + 4 digits |
| name | string | `"Toner cartridge K-26, black"`. Generic names only, **no real brand names**. |
| category | enum | `Paper & Stationery` (PAP), `Printer Supplies` (PRN), `Computer Peripherals` (PER), `Cables & Networking` (CBL), `Office Furniture` (FUR) |
| unit_cost | number | USD, 2 decimals (range by category, §7.4) |
| supplier | string | Invented supplier name, e.g. `"Northgate Office Supply Co."` |
| lead_time_days | integer | 5–30 |

**stock** (one row per product per warehouse that carries it)
| Field | Type | Notes |
|---|---|---|
| sku | string | → product |
| warehouse | string | → warehouse.id |
| qty_on_hand | integer | ≥ 0 |
| reorder_point | integer | > 0 |

**stock_history** (monthly snapshot per warehouse per category)
| Field | Type | Notes |
|---|---|---|
| date | string | ISO date, 7th of each month |
| warehouse | string | |
| category | string | |
| value | number | USD |

**shipment**
| Field | Type | Notes |
|---|---|---|
| id | string | `"SH-48211"` |
| direction | enum | `inbound` (supplier → warehouse) or `outbound` (warehouse → customer) |
| origin | string | Supplier name for inbound, warehouse id for outbound |
| destination | string | Warehouse id for inbound; customer city/state for outbound (e.g. `"Dayton, OH"`, no customer names) |
| status | enum | `scheduled`, `in_transit`, `delivered`. "Late" is **derived**, never stored. |
| ship_date | string | ISO date |
| eta | string | ISO date |
| delivered_at | string \| null | ISO date, null unless delivered |
| carrier | string | One of 4 invented carriers: `Ridgeway Freight`, `BlueLine Logistics`, `Summit Express`, `Harbor & Pine Transport` |
| lines | array | `[{ sku, qty }]`, 1–25 lines |

**meta**: `{ "generated_at": "2026-11-07T08:00:00-05:00", "seed": 20261107, "currency": "USD", "locale": "en-US" }`

### 7.3 Sample payload

```json
{
  "meta": { "generated_at": "2026-11-07T08:00:00-05:00", "seed": 20261107, "currency": "USD", "locale": "en-US" },
  "warehouses": [
    { "id": "CMH", "name": "Columbus OH", "timezone": "America/New_York" },
    { "id": "RNO", "name": "Reno NV", "timezone": "America/Los_Angeles" },
    { "id": "ATL", "name": "Atlanta GA", "timezone": "America/New_York" }
  ],
  "products": [
    { "sku": "PRN-0412", "name": "Toner cartridge K-26, black", "category": "Printer Supplies", "unit_cost": 58.00, "supplier": "Northgate Office Supply Co.", "lead_time_days": 12 },
    { "sku": "PER-0218", "name": "USB-C hub, 7-port, aluminum", "category": "Computer Peripherals", "unit_cost": 21.40, "supplier": "Cobalt Peripherals Inc.", "lead_time_days": 18 },
    { "sku": "PAP-0007", "name": "Copy paper, letter, 20 lb, case of 10 reams", "category": "Paper & Stationery", "unit_cost": 34.75, "supplier": "Millbrook Paper Mills", "lead_time_days": 7 }
  ],
  "stock": [
    { "sku": "PRN-0412", "warehouse": "RNO", "qty_on_hand": 0,   "reorder_point": 40 },
    { "sku": "PER-0218", "warehouse": "CMH", "qty_on_hand": 12,  "reorder_point": 30 },
    { "sku": "PAP-0007", "warehouse": "CMH", "qty_on_hand": 860, "reorder_point": 300 }
  ],
  "stock_history": [
    { "date": "2026-10-07", "warehouse": "CMH", "category": "Paper & Stationery", "value": 538210.40 },
    { "date": "2026-11-07", "warehouse": "CMH", "category": "Paper & Stationery", "value": 551902.15 }
  ],
  "shipments": [
    { "id": "SH-48211", "direction": "inbound", "origin": "Northgate Office Supply Co.", "destination": "RNO", "status": "in_transit", "ship_date": "2026-10-29", "eta": "2026-11-03", "delivered_at": null, "carrier": "Ridgeway Freight", "lines": [{ "sku": "PRN-0412", "qty": 120 }] },
    { "id": "SH-48230", "direction": "outbound", "origin": "CMH", "destination": "Dayton, OH", "status": "delivered", "ship_date": "2026-11-02", "eta": "2026-11-04", "delivered_at": "2026-11-04", "carrier": "Summit Express", "lines": [{ "sku": "PAP-0007", "qty": 40 }, { "sku": "PER-0218", "qty": 6 }] },
    { "id": "SH-48266", "direction": "inbound", "origin": "Cobalt Peripherals Inc.", "destination": "CMH", "status": "scheduled", "ship_date": "2026-11-10", "eta": "2026-11-17", "delivered_at": null, "carrier": "BlueLine Logistics", "lines": [{ "sku": "PER-0218", "qty": 200 }] }
  ]
}
```

### 7.4 Mock data (full data set)

The mock data must behave like an **established business running since 2019**, not like a demo with 40 rows.

- **Date range:** shipments from **2023-11-01 to 2026-11-07** (3 years + 1 week), plus scheduled shipments up to **2026-11-28**. `stock_history`: 37 monthly snapshots (2023-11-07 … 2026-11-07) × 3 warehouses × 5 categories = **555 rows**.
- **Volume (exact):**
  - **642 products**: PAP 160, PRN 128, PER 150, CBL 120, FUR 84.
  - **1,410 stock rows**: Columbus carries all 642; Reno 430; Atlanta 338.
  - **About 26,000 shipments** (generator target **26,000 ± 2%**): about 70% outbound, 30% inbound. Average volume is 24 per business day, growing about **8% per year**.
  - **Exactly 4 carriers, 18 suppliers and 60 customer destination cities.**
- **Snapshot state on 2026-11-07:**
  - Exactly **9 stock rows Out** and **31 Low** across all warehouses.
  - **58 in transit** and **14 open shipments late**.
  - On-time % for the last 30 days between **88% and 94%**.
  - Total stock value **$4.5M–$5.2M**.

  These targets are tested.
- **Realism rules:**
  - **Seasonality:** back-to-school peak (Jul–Aug, +35% outbound), year-end budget flush (Nov–Dec, +20%), and a quiet late December holiday week (−50%) and July 4 week (−20%).
  - **Weekdays:** shipments only Mon–Fri. Saturday has about 3% of a weekday's volume, and Sunday 0%.
  - **Lead times:** transit time is 1–5 days outbound and 3–14 days inbound, with a right-skewed distribution.
  - **Lateness:** about 8% of deliveries are late overall. Rates are worse in Dec–Jan (weather, about 14%) and for one carrier (`Harbor & Pine Transport`, about 15%).
  - **Outliers:** a few extreme cases (0.3%) are 10+ days late. One inbound shipment from 2025 is "delivered" 23 days late.
  - **Unit costs by category:** PAP $2–$60, PRN $8–$180, PER $6–$320, CBL $3–$90, FUR $45–$680.
  - **Quantities:** realistic per category (paper in the hundreds of cases; furniture 0–60 units).
  - **Consistency:** every `shipment.lines.sku` exists in `products`, and every outbound origin warehouse stocks that SKU.
  - **Stock value growth:** gradual, about 6% per year, with a dip each January after year-end.
- **Generation:**
  - `scripts/generate-data.js` is Node ≥ 18 with **no dependencies**. It uses a seeded PRNG (mulberry32, seed `20261107`). The same seed produces byte-identical output.
  - It writes `data/mock-data.json`. Both files are committed. The site only reads the JSON, so there is no build step.
- **Privacy:** no real people, companies, brands, addresses, phone numbers or IDs.
  - Supplier, carrier and product names are invented and generic.
  - Customers appear only as city + state.
  - If any email ever appears, it uses `@example.com`.

---

## 8. States & interaction

| State | What the user sees | Exact text |
|---|---|---|
| **Loading** | 7 skeleton tiles, a skeleton chart block and 8 skeleton table rows in `--teal-50`, pulsing at 1.2 s (static under reduced motion). The header and logo render immediately. | (screen reader) "Loading dashboard data…" in an `aria-live="polite"` region |
| **Empty (filters)** | Inside the table card: a 24 px search icon and a message, with a secondary button. | "No products match these filters." + **[Clear filters]** · Shipments: "No shipments match these filters." + **[Clear filters]** |
| **Empty (alerts)** | Panel text in `--green-700` with a ✓ icon. | "✓ Nothing below reorder point." |
| **Error** | A banner under the header: `--red-50` background, `--red-700` text and icon, with a **[Retry]** primary button. If data was loaded before, the last numbers stay visible and a "Stale" badge (`--amber-50` / `--amber-800`) appears next to "Data as of". | "Couldn't load the latest data. Showing the last loaded numbers." / (first load) "Couldn't load dashboard data." + **[Retry]** |
| **Data as of** | Always in the header. | "Data as of Nov 7, 2026, 8:00 AM ET · Mock data" (from `meta.generated_at`, formatted with `Intl.DateTimeFormat('en-US')`) |

**Interaction:**
- The warehouse switcher, all filters, search, sort, paging and chart toggles update the page **without a reload**, in under 100 ms on desktop.
- Filters reset to defaults on reload; there is no `localStorage`. The current warehouse is reflected in the URL hash (`#wh=RNO`) so a link can be shared. This is the only state kept in the URL.
- **Motion:** KPI values count up from 0 in **≤ 600 ms** on first load and on warehouse change. Tooltips and the dialog fade in 150 ms. Under `prefers-reduced-motion: reduce`, all motion is off and values appear instantly.
- There are no gesture-only interactions. Every action is a visible button or control.

---

## 9. Accessibility

- All text meets **WCAG 2.1 AA** (4.5 : 1, large text 3 : 1), as tabled in §5.2. Amber is never used as text.
- Every touch target is **≥ 44 × 44 px** (§5.5).
- Every icon has a visible text label. Decorative SVGs are `aria-hidden="true"`, and icon-bearing controls have an accessible name from their text.
- The chart has a text summary (§6.9) and a "Show as table" toggle. Bars are focusable, and their tooltip is announced.
- Status badges are text, so screen readers read "Low" and "Out", not colours.
- The layout holds up at **200% text zoom** with no overlap or clipping (tested at 1280 px).
- **Full keyboard navigation:**
  - logical tab order: header → alerts → tiles → chart → alerts panel → filters → table → pagination → shipments
  - Enter/Space activate controls
  - Enter opens a row's dialog
  - Esc closes the dialog and tooltips
  - focus is trapped in the dialog and returns to the trigger
  - visible focus ring (§6.11)
- Live region announces result counts after filtering, e.g. "31 products shown".
- `lang="en"` and one `<h1>`. Headings follow order (h1 → h2 per section).
- **Light mode only** in v1. Dark mode is on the IT IS NOT list.

---

## 10. Technical notes

- **Stack:** HTML5 + CSS + vanilla JS (ES2022+ modules). No frameworks, no CSS frameworks and no build step. The only external resource is the Inter font from Google Fonts.
- **HTML:**
  - semantic `header`, `nav`, `main`, `section` (with `aria-labelledby`), `table` with `caption` and `th scope`, `button`, `dialog`
  - ARIA only where native elements are not enough (`aria-sort`, `aria-live`, `aria-pressed` on segmented controls)
  - valid markup (W3C validator: 0 errors)
- **CSS:**
  - organised with `@layer reset, tokens, layout, components, utilities`
  - a custom property for **every** token (colours, spacing, radius, shadow, font sizes)
  - Grid for the page and KPI row, Flexbox inside components
  - `clamp()` for type and spacing, and a container query on KPI tiles (value 28 px when the tile is < 160 px wide)
  - `:focus-visible`, `@media (prefers-reduced-motion: reduce)`, and logical properties (`margin-inline`, `padding-block`)
- **JavaScript (ES modules, no globals, no inline handlers):**
  - `js/data.js`: fetch and validate JSON
  - `js/metrics.js`: pure functions for every §7.1 formula
  - `js/state.js`: filters and warehouse, plus a subscribe/notify pattern
  - `js/kpis.js`
  - `js/chart.js`: SVG bar chart
  - `js/tables.js`: inventory and shipments, sort/filter/page
  - `js/dialog.js`
  - `js/format.js`: `Intl.NumberFormat('en-US', {style:'currency', currency:'USD'})`, compact notation, and `Intl.DateTimeFormat`
  - `js/main.js`
- **Charts:** hand-built inline SVG. No chart library.
- **Test seam:** `js/data.js` accepts `?data=<file>.json` (a file name inside `data/` only) so `tests/tests.html` can simulate a failed load. It is not linked anywhere in the UI.
- **File structure:**
  ```
  index.html
  css/styles.css
  js/*.js
  data/mock-data.json
  assets/logo.svg, logo-icon.svg, logo.png
  scripts/generate-data.js
  tests/tests.html + tests/run-tests.mjs (Node, no dependencies)
  README.md, SPEC.md, Practice.md, CLAUDE.md
  ```
- **Favicon:** `assets/logo-icon.svg`. PWA install is Later (L4).
- **Performance:**
  - first meaningful paint < 2 s on simulated 4G
  - the JSON is fetched asynchronously after the shell renders, and is ≤ 8 MB uncompressed (about 7.5 MB for the §7.4 volume; GitHub Pages serves it gzip-compressed)
  - tables render only the current page (25 rows)
- **Quality bar:**
  - 0 console errors or warnings
  - Lighthouse Performance, Accessibility and Best Practices **≥ 90** (desktop)
  - no secrets in the repo
  - works when served from any static server, including GitHub Pages under a sub-path (all URLs relative)

---

## 11. Done means (acceptance criteria)

Each line can pass or fail. These become the tests (`tests/`) and the Prompt 5 audit.

**M1: KPI tiles**
- [ ] Exactly 7 tiles appear, in the §6.3 order, with the §6.3 labels.
- [ ] With "All warehouses", the values equal the §7.1 formulas computed from `data/mock-data.json`. The tests compute them independently, and the snapshot targets in §7.4 hold (Out = 9, Low = 31, In transit = 58, Late = 14).
- [ ] Every delta shows an arrow **and** a sign; on-time delta is in "pts".

**M2: Warehouse switcher**
- [ ] Choosing "Reno NV" changes all 7 tiles, the chart, the alerts panel and both tables so that they only include RNO data, without a page reload (no `load` event fires).
- [ ] The URL hash becomes `#wh=RNO`. Opening the page with `#wh=RNO` starts on Reno.

**M3: Low-stock alerts**
- [ ] The panel count equals Low + Out for the current warehouse. Out rows are listed before Low rows.
- [ ] "See all in inventory →" filters the table to Low + Out, and the table count equals the panel count.

**M4: Inventory table**
- [ ] Searching "0412" shows only rows whose SKU or name contains "0412" (case-insensitive).
- [ ] Filtering Status = Out shows only rows with `qty_on_hand = 0`, and the title count matches.
- [ ] Clicking "Qty" sorts ascending, and a second click sorts descending. `aria-sort` reflects the order.
- [ ] Shows 25 rows per page, and the pagination total equals ceil(filtered ÷ 25).

**M5: Shipments**
- [ ] By default, all late shipments are listed before non-late ones. Each late row shows "(N days late)" where N = today − eta.
- [ ] Direction = Inbound shows only `direction = inbound` rows.

**M6: Stock value chart**
- [ ] "By category" shows 5 bars whose values sum to the Stock value tile (±$1 rounding).
- [ ] Clicking or tapping a bar shows its tooltip. Pressing Tab to a bar and then Enter also shows it. Esc closes it.
- [ ] "Show as table" shows a table with the same numbers, and the text summary names the largest group.

**M7: Row detail**
- [ ] Clicking a row opens a `<dialog>` that lists every field of the record. Esc closes it and focus returns to the row.
- [ ] At 375 px, the Supplier and Unit cost (hidden table columns) are visible in the dialog.

**M8: Data as of**
- [ ] The header shows "Data as of Nov 7, 2026, 8:00 AM ET · Mock data".

**States**
- [ ] A filter with no results shows the exact empty text from §8 and a working [Clear filters] button.
- [ ] If the JSON fails to load (simulated), the error banner shows the §8 text and [Retry] reloads the data.

**Mock data**
- [ ] `node scripts/generate-data.js` run twice produces byte-identical `data/mock-data.json`.
- [ ] Shipments cover 2023-11-01 … 2026-11-07, the count is 26,000 ± 2%, there are 642 products and 1,410 stock rows, and no Sunday shipments.
- [ ] No string in the data matches a real-brand blocklist (e.g. HP, Canon, Dell, Logitech, Staples, FedEx, UPS, USPS) as a whole word.

**Global checklist**
- [ ] Only the 17 palette colours from §5.2 appear in CSS, SVG and JS (plus `rgba(20,38,43,…)` shadows). A test greps for any other hex/rgb/hsl/named colour.
- [ ] Red appears only on Out, Late and the error banner.
- [ ] No horizontal page scroll at 320, 375, 768, 1024 and 1440 px.
- [ ] Every interactive element is ≥ 44 × 44 px.
- [ ] Every icon has a visible text label.
- [ ] All text meets AA contrast (pairs in §5.2 only).
- [ ] The logo appears in the header at 40 px height on White, unaltered.
- [ ] Inter is the computed font family of body text.
- [ ] Nothing from the "IT IS NOT" list exists: no login, no edit controls, no order/reorder buttons, no email/SMS, no dark mode, no CSV export (that is Should, v1.1).
- [ ] No React/Angular/Vue/Svelte/jQuery/Bootstrap/Tailwind in any file. There is no `package.json` build step.
- [ ] The console shows 0 errors. Lighthouse (desktop) Performance, Accessibility and Best Practices are ≥ 90.
