// Warehouse weather from OpenWeatherMap (SPEC §7.6).
// Pure functions: the server uses toWarehouseWeather(), the page uses renderWeather(). No network here.

// Coordinates of the three warehouse cities (city centre is precise enough for weather).
export const WAREHOUSE_COORDS = {
  CMH: { lat: 39.9612, lon: -82.9988 },
  RNO: { lat: 39.5296, lon: -119.8138 },
  ATL: { lat: 33.749, lon: -84.388 },
};

export const STRONG_WIND_MPH = 30;

/**
 * Could this weather delay trucks? OpenWeatherMap condition codes:
 * 2xx thunderstorm, 502–504 heavy rain, 511 freezing rain, 6xx snow, plus wind or gusts ≥ 30 mph.
 * Returns the reason in plain words, or null.
 */
export function delayReason(code, windMph, gustMph = 0) {
  if (code >= 200 && code < 300) return 'Thunderstorm';
  if (code >= 600 && code < 700) return 'Snow';
  if (code === 511) return 'Freezing rain';
  if (code >= 502 && code <= 504) return 'Heavy rain';
  if (Math.max(windMph || 0, gustMph || 0) >= STRONG_WIND_MPH) return 'Strong wind';
  return null;
}

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

/** One OpenWeatherMap "current weather" response (units=imperial) -> the fields the panel shows. */
export function toWarehouseWeather(warehouse, owm) {
  const w = (owm.weather && owm.weather[0]) || {};
  const wind = owm.wind || {};
  return {
    id: warehouse.id,
    name: warehouse.name,
    temp_f: Math.round(owm.main.temp),
    feels_like_f: Math.round(owm.main.feels_like),
    condition: cap(w.description || w.main || ''),
    code: w.id ?? 0,
    wind_mph: Math.round(wind.speed || 0),
    delay: delayReason(w.id ?? 0, wind.speed, wind.gust),
    observed_at: new Date(owm.dt * 1000).toISOString(),
  };
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Renders the panel body. `weather` is the /api/weather payload or null (unavailable). */
export function renderWeather(el, weather, wh = 'ALL') {
  if (!weather) {
    el.innerHTML = '<p class="weather__empty">Weather unavailable right now. The rest of the dashboard is not affected.</p>';
    return;
  }
  const rows = weather.warehouses.filter((w) => wh === 'ALL' || w.id === wh);
  el.innerHTML = `<ul class="weather-list">${rows.map((w) => `
    <li>
      <span class="weather-list__name">${esc(w.name)}</span>
      <span class="weather-list__temp">${w.temp_f}°F</span>
      <span class="weather-list__meta">${esc(w.condition)} · wind ${w.wind_mph} mph</span>
      ${w.delay
        ? `<span class="badge badge--low"><svg class="icon" aria-hidden="true"><use href="#i-warn"/></svg>${esc(w.delay)}: may delay shipments</span>`
        : '<span class="weather-list__ok">No weather delays expected</span>'}
    </li>`).join('')}</ul>`;
}
