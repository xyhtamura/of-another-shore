const WEATHER_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'precipitation',
  'cloud_cover',
  'wind_speed_10m',
  'wind_direction_10m'
];

const phraseColors = ['#3d8eb9', '#8566aa', '#6f8f7e', '#b66f68', '#647da0', '#8b735f', '#7a6aa5'];
const choiceOffsets = new Map();

let config;
let weatherByCity = {};
let weatherRequestMs = null;
let networkMetrics = readNetworkMetrics();

const status = document.querySelector('#status');
const refreshButton = document.querySelector('#refresh');
const phraseButtons = [...document.querySelectorAll('.weather-phrase')];

function readNetworkMetrics() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType ?? 'unknown',
    rtt: Number.isFinite(connection?.rtt) && connection.rtt > 0 ? connection.rtt : null,
    downlink: Number.isFinite(connection?.downlink) ? connection.downlink : null,
    requestTime: weatherRequestMs
  };
}

function matches(metrics, conditions) {
  return Object.entries(conditions).every(([field, range]) => {
    const value = metrics[field];
    if (value === null || value === undefined) return false;
    if ('equals' in range && value !== range.equals) return false;
    if ('min' in range && value < range.min) return false;
    if ('max' in range && value > range.max) return false;
    return true;
  });
}

function hash(text) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function interpolate(text, metrics) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, field) => {
    const value = metrics[field];
    return value === null || value === undefined ? 'unmeasured' : String(value);
  });
}

function describe(source, metrics) {
  if (source === 'internet') {
    const parts = [metrics.online ? 'online' : 'offline'];
    if (metrics.effectiveType !== 'unknown') parts.push(metrics.effectiveType);
    if (metrics.rtt !== null) parts.push(`${metrics.rtt} ms RTT estimate`);
    if (metrics.downlink !== null) parts.push(`${metrics.downlink} Mb/s estimate`);
    if (metrics.requestTime !== null) parts.push(`${metrics.requestTime} ms weather request`);
    return `internet: ${parts.join(', ')}`;
  }

  return `${source}: ${Math.round(metrics.temperature)}°C, ${Math.round(metrics.humidity)}% humidity, ${metrics.windSpeed} km/h wind, ${metrics.cloudCover}% cloud cover`;
}

function metricsFor(source) {
  return source === 'internet' ? networkMetrics : weatherByCity[source];
}

function renderLine(line, animate = false) {
  const button = phraseButtons.find((item) => item.dataset.line === line.id);
  const metrics = metricsFor(line.source);
  if (!button || !metrics) return;

  const rule = line.rules.find((candidate) => matches(metrics, candidate.when));
  if (!rule || !rule.options.length) return;

  const offset = choiceOffsets.get(line.id) ?? 0;
  const fiveMinuteWindow = Math.floor(Date.now() / 300000);
  const baseIndex = hash(`${line.id}:${JSON.stringify(metrics)}:${fiveMinuteWindow}`) % rule.options.length;
  const option = rule.options[(baseIndex + offset) % rule.options.length];
  const phrase = interpolate(option, metrics);

  if (animate) button.classList.add('changing');
  window.setTimeout(() => {
    const leading = button.dataset.leadingEllipsis === 'true' ? '...' : '';
    const trailing = button.dataset.trailingEllipsis === 'true' ? '...' : '';
    button.textContent = `${leading}${phrase}${trailing}`;
    button.title = describe(line.source, metrics);
    button.style.setProperty('--phrase-color', phraseColors[config.lines.indexOf(line) % phraseColors.length]);
    button.classList.remove('changing');
  }, animate ? 170 : 0);
}

function applyLineFrames() {
  config.lines.forEach((line) => {
    const button = phraseButtons.find((item) => item.dataset.line === line.id);
    if (!button) return;
    const leadingEllipsis = line.prefix === '...';
    const trailingEllipsis = line.suffix === '...';
    button.dataset.leadingEllipsis = String(leadingEllipsis);
    button.dataset.trailingEllipsis = String(trailingEllipsis);
    button.parentElement.replaceChildren(
      document.createTextNode(leadingEllipsis ? '' : line.prefix),
      button,
      document.createTextNode(trailingEllipsis ? '' : line.suffix)
    );
  });
}

function renderAll(animate = false) {
  networkMetrics = readNetworkMetrics();
  config.lines.forEach((line) => renderLine(line, animate));
}

function normalizeWeather(report, fallback) {
  const current = report?.current;
  if (!current) return fallback;
  return {
    temperature: current.temperature_2m ?? fallback.temperature,
    humidity: current.relative_humidity_2m ?? fallback.humidity,
    precipitation: current.precipitation ?? fallback.precipitation,
    cloudCover: current.cloud_cover ?? fallback.cloudCover,
    windSpeed: current.wind_speed_10m ?? fallback.windSpeed,
    windDirection: current.wind_direction_10m ?? fallback.windDirection
  };
}

async function loadWeather(animate = false) {
  const cities = Object.entries(config.cities);
  const latitudes = cities.map(([, city]) => city.latitude).join(',');
  const longitudes = cities.map(([, city]) => city.longitude).join(',');
  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitudes}&longitude=${longitudes}&current=${WEATHER_FIELDS.join(',')}&timezone=auto&forecast_days=1`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6000);
  const requestStarted = performance.now();
  status.textContent = 'reading weather';

  try {
    const response = await fetch(endpoint, { signal: controller.signal });
    if (!response.ok) throw new Error(`Weather response ${response.status}`);
    const payload = await response.json();
    weatherRequestMs = Math.round(performance.now() - requestStarted);
    const reports = Array.isArray(payload) ? payload : [payload];
    weatherByCity = Object.fromEntries(cities.map(([name, city], index) => [
      name,
      normalizeWeather(reports[index], city.fallback)
    ]));
    status.textContent = 'weather received';
  } catch (error) {
    weatherByCity = Object.fromEntries(cities.map(([name, city]) => [name, city.fallback]));
    status.textContent = 'using stored weather';
  } finally {
    window.clearTimeout(timeout);
  }

  renderAll(animate);
}

async function start() {
  try {
    const response = await fetch('weather-lines.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Line data response ${response.status}`);
    config = await response.json();
    applyLineFrames();
    await loadWeather(false);
  } catch (error) {
    status.textContent = 'using page text';
  }
}

phraseButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const line = config?.lines.find((item) => item.id === button.dataset.line);
    if (!line) return;
    choiceOffsets.set(line.id, (choiceOffsets.get(line.id) ?? 0) + 1);
    renderLine(line, true);
  });
});

refreshButton.addEventListener('click', () => {
  if (config) loadWeather(true);
});

window.addEventListener('online', () => renderAll(true));
window.addEventListener('offline', () => renderAll(true));

const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
connection?.addEventListener?.('change', () => renderAll(true));

window.setInterval(() => {
  if (config) loadWeather(true);
}, 300000);

start();
