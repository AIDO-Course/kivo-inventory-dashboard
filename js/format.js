// Number and date formatting with Intl (SPEC §10).
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const usdCompact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usdWhole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const int = new Intl.NumberFormat('en-US');
const pct1 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const asOfFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });

export const money = (n) => usd.format(n);
export const moneyCompact = (n) => usdCompact.format(n);
export const moneyWhole = (n) => usdWhole.format(n);
export const count = (n) => int.format(n);
export const pct = (n) => `${pct1.format(n)}%`;
export const oneDecimal = (n) => pct1.format(n);
export const date = (iso) => dateFmt.format(new Date(iso + 'T00:00:00Z'));
export const dateShort = (iso) => shortDate.format(new Date(iso + 'T00:00:00Z'));
export const asOf = (isoDateTime) => `${asOfFmt.format(new Date(isoDateTime))} ET`;

/** Signed delta with arrow: "▲ 2.1%" / "▼ 1.2 pts". Arrow and sign are always shown. */
export function delta(n, unit = '%') {
  const arrow = n > 0 ? '▲' : n < 0 ? '▼' : '▶';
  const sign = n > 0 ? '+' : n < 0 ? '−' : '±';
  const text = unit === 'pts' ? `${pct1.format(Math.abs(n))} pts` : `${pct1.format(Math.abs(n))}%`;
  return `${arrow} ${sign}${text}`;
}
