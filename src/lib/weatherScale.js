/* ─── Weather Scale Engine Utility ────────────────────────────────────────── */

/**
 * Weather Layer Configurations
 */
export const WEATHER_SCALE_CONFIG = {
  temp_new: {
    name: 'Temperature',
    unit: '°C',
    targetBuckets: 7,
    allowedSteps: [10, 5, 2, 1, 0.5, 0.2, 0.1],
    defaultMin: 15,
    defaultMax: 35,
    palette: [
      { stop: 0.0, color: '#38bdf8' }, // Severe Cold / Ice Blue
      { stop: 0.2, color: '#34d399' }, // Cool / Aquamarine
      { stop: 0.4, color: '#a3e635' }, // Mild / Lime Green
      { stop: 0.6, color: '#facc15' }, // Moderate / Solar Yellow
      { stop: 0.75, color: '#fb923c' }, // Warm / Vibrant Orange
      { stop: 0.9, color: '#f87171' }, // Hot / Crimson Red
      { stop: 1.0, color: '#e11d48' }, // Sweltering / Deep Magenta
    ],
  },
  precipitation_new: {
    name: 'Precipitation',
    unit: 'mm/h',
    targetBuckets: 6,
    isPrecipitation: true,
    allowedSteps: [0.1, 0.2, 0.5, 1, 2, 5, 10, 20],
    defaultMin: 0,
    defaultMax: 15,
    palette: [
      { stop: 0.0, color: '#0f172a' }, // Slate Clear
      { stop: 0.2, color: '#38bdf8' }, // Light Drizzle / Sky Blue
      { stop: 0.4, color: '#6366f1' }, // Moderate Shower / Indigo
      { stop: 0.7, color: '#a855f7' }, // Heavy Downpour / Purple
      { stop: 1.0, color: '#ec4899' }, // Extreme Torrent / Magenta
    ],
  },
  clouds_new: {
    name: 'Clouds',
    unit: '%',
    targetBuckets: 6,
    boundedMin: 0,
    boundedMax: 100,
    allowedSteps: [20, 10, 5],
    defaultMin: 0,
    defaultMax: 100,
    palette: [
      { stop: 0.0, color: 'rgba(255, 255, 255, 0.15)' },
      { stop: 0.35, color: 'rgba(255, 255, 255, 0.45)' },
      { stop: 0.7, color: 'rgba(255, 255, 255, 0.75)' },
      { stop: 1.0, color: 'rgba(255, 255, 255, 0.95)' },
    ],
  },
  wind_new: {
    name: 'Wind Speed',
    unit: 'm/s',
    targetBuckets: 7,
    allowedSteps: [20, 10, 5, 2, 1, 0.5],
    defaultMin: 0,
    defaultMax: 20,
    palette: [
      { stop: 0.0, color: '#4ade80' }, // Calm / Soft Emerald
      { stop: 0.25, color: '#a3e635' }, // Light Breeze / Lime
      { stop: 0.5, color: '#facc15' }, // Moderate Wind / Yellow
      { stop: 0.75, color: '#fb923c' }, // Strong Gale / Orange
      { stop: 1.0, color: '#ef4444' }, // Severe Gale / Crimson
    ],
  },
  radar: {
    name: 'Radar',
    unit: 'dBZ',
    targetBuckets: 4,
    isRadar: true,
    palette: [
      { stop: 0.0, color: '#2563eb' },
      { stop: 0.33, color: '#16a34a' },
      { stop: 0.66, color: '#eab308' },
      { stop: 1.0, color: '#dc2626' },
    ],
  },
};

/**
 * Calculates a "nice" step size based on range and allowed step increments
 */
export function calculateNiceStep(rawRange, targetBuckets = 7, allowedSteps = [10, 5, 2, 1, 0.5, 0.2, 0.1]) {
  if (rawRange <= 0) return allowedSteps[allowedSteps.length - 1];
  const idealStep = rawRange / targetBuckets;

  let bestStep = allowedSteps[0];
  let minDiff = Infinity;

  for (const step of allowedSteps) {
    const diff = Math.abs(step - idealStep);
    if (diff < minDiff) {
      minDiff = diff;
      bestStep = step;
    }
  }

  return bestStep;
}

/**
 * Interpolates color from palette at ratio (0.0 to 1.0)
 */
export function interpolateColor(palette, ratio) {
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  if (!palette || palette.length === 0) return '#38bdf8';
  if (palette.length === 1) return palette[0].color;

  for (let i = 0; i < palette.length - 1; i++) {
    const p1 = palette[i];
    const p2 = palette[i + 1];
    if (clampedRatio >= p1.stop && clampedRatio <= p2.stop) {
      return p2.color;
    }
  }
  return palette[palette.length - 1].color;
}

/**
 * Primary Dynamic Scale Generator
 */
export function generateDynamicScale({ type = 'temp_new', data = [], zoom = 8, bounds = null }) {
  const config = WEATHER_SCALE_CONFIG[type] || WEATHER_SCALE_CONFIG.temp_new;

  // Radar handling
  if (config.isRadar) {
    let radarDetail = 'Regional Radar Scale';
    let labels = ['Light Rain (Blue)', 'Moderate Rain (Green)', 'Heavy Rain (Yellow)', 'Extreme Storm (Red)'];
    if (zoom <= 5) {
      radarDetail = 'Macro Radar Scale (Greater Areas)';
      labels = ['Rain Fronts', 'Monsoon Belts', 'Severe Storm Cells', 'Extreme Typhoons'];
    } else if (zoom >= 11) {
      radarDetail = 'Local Radar Scale (Street Level)';
      labels = ['Trace Drizzle', 'Local Showers', 'Heavy Downpour', 'Flash Flood Hazard'];
    }

    return {
      type,
      name: config.name,
      unit: config.unit,
      zoom,
      detailLabel: radarDetail,
      radarLabels: labels,
      ranges: [
        { min: 0, max: 15, label: labels[0], color: '#1049a7' },
        { min: 15, max: 30, label: labels[1], color: '#2da835' },
        { min: 30, max: 45, label: labels[2], color: '#ffb200' },
        { min: 45, max: 60, label: labels[3], color: '#e60000' },
      ],
      colors: ['#1049a7', '#2da835', '#ffb200', '#e60000'],
    };
  }

  // Filter numeric values
  const validValues = (Array.isArray(data) ? data : []).filter((v) => typeof v === 'number' && !isNaN(v));

  let dataMin = validValues.length > 0 ? Math.min(...validValues) : config.defaultMin;
  let dataMax = validValues.length > 0 ? Math.max(...validValues) : config.defaultMax;

  // Bounded checks (e.g. Clouds 0-100%)
  if (config.boundedMin !== undefined) dataMin = Math.max(config.boundedMin, dataMin);
  if (config.boundedMax !== undefined) dataMax = Math.min(config.boundedMax, dataMax);

  // Equal or very small range edge case handling
  if (dataMax - dataMin < 0.1) {
    dataMin = Math.max(config.boundedMin !== undefined ? config.boundedMin : -Infinity, dataMin - 1.5);
    dataMax = Math.min(config.boundedMax !== undefined ? config.boundedMax : Infinity, dataMax + 1.5);
  }

  // Precipitation handling (Zero rainfall distinguished)
  if (config.isPrecipitation) {
    const activeMax = Math.max(dataMax, 2);

    let buckets = [];
    if (activeMax <= 3) {
      buckets = [
        { min: 0, max: 0, label: '0 mm/h (Clear)', color: '#0f172a' },
        { min: 0.01, max: 0.5, label: '0.1 – 0.5 mm/h (Light)', color: '#38bdf8' },
        { min: 0.5, max: 1.5, label: '0.5 – 1.5 mm/h (Shower)', color: '#6366f1' },
        { min: 1.5, max: 3.0, label: '1.5 – 3.0 mm/h (Moderate)', color: '#a855f7' },
        { min: 3.0, max: 10.0, label: '> 3.0 mm/h (Heavy)', color: '#ec4899' },
      ];
    } else if (activeMax <= 15) {
      buckets = [
        { min: 0, max: 0, label: '0 mm/h (Clear)', color: '#0f172a' },
        { min: 0.01, max: 1.0, label: '0.1 – 1.0 mm/h (Drizzle)', color: '#38bdf8' },
        { min: 1.0, max: 5.0, label: '1.0 – 5.0 mm/h (Moderate)', color: '#6366f1' },
        { min: 5.0, max: 10.0, label: '5.0 – 10.0 mm/h (Heavy)', color: '#a855f7' },
        { min: 10.0, max: 25.0, label: '> 10.0 mm/h (Torrent)', color: '#ec4899' },
      ];
    } else {
      buckets = [
        { min: 0, max: 0, label: '0 mm/h (Clear)', color: '#0f172a' },
        { min: 0.01, max: 2.0, label: '0.1 – 2.0 mm/h (Light)', color: '#38bdf8' },
        { min: 2.0, max: 10.0, label: '2.0 – 10.0 mm/h (Moderate)', color: '#6366f1' },
        { min: 10.0, max: 25.0, label: '10.0 – 25.0 mm/h (Heavy)', color: '#a855f7' },
        { min: 25.0, max: 50.0, label: '> 25.0 mm/h (Monsoon)', color: '#ec4899' },
      ];
    }

    return {
      type,
      name: config.name,
      unit: config.unit,
      min: Number(dataMin.toFixed(1)),
      max: Number(dataMax.toFixed(1)),
      zoom,
      ranges: buckets,
      colors: buckets.map((b) => b.color),
    };
  }

  // Linear calculation for Temp, Clouds, Wind Speed
  const rawRange = dataMax - dataMin;
  const step = calculateNiceStep(rawRange, config.targetBuckets, config.allowedSteps);

  // Round start & end to step multiples
  let startVal = Math.floor(dataMin / step) * step;
  let endVal = Math.ceil(dataMax / step) * step;

  if (startVal === endVal) endVal = startVal + step;

  const buckets = [];
  let currentVal = startVal;
  const totalBuckets = Math.min(10, Math.max(4, Math.round((endVal - startVal) / step)));
  const actualStep = (endVal - startVal) / totalBuckets;

  for (let i = 0; i < totalBuckets; i++) {
    const bMin = currentVal;
    const bMax = currentVal + actualStep;
    const ratio = (i + 0.5) / totalBuckets;
    const color = interpolateColor(config.palette, ratio);

    const formatVal = (v) => {
      if (actualStep < 0.5) return v.toFixed(1);
      return Math.round(v).toString();
    };

    let label = `${formatVal(bMin)} – ${formatVal(bMax)} ${config.unit}`;
    if (i === 0) label = `< ${formatVal(bMax)} ${config.unit}`;
    if (i === totalBuckets - 1) label = `> ${formatVal(bMin)} ${config.unit}`;

    buckets.push({
      min: Number(bMin.toFixed(2)),
      max: Number(bMax.toFixed(2)),
      label,
      color,
    });

    currentVal = bMax;
  }

  return {
    type,
    name: config.name,
    unit: config.unit,
    min: Number(dataMin.toFixed(1)),
    max: Number(dataMax.toFixed(1)),
    step: Number(actualStep.toFixed(2)),
    zoom,
    ranges: buckets,
    colors: buckets.map((b) => b.color),
  };
}
