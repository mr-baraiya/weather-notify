import PDFDocument from 'pdfkit';
import { Country } from 'country-state-city';
import { getWeatherTip, formatTime, getAQIStatus, getUVStatus } from './alertTemplates.js';

const formatDisplayDate = (dateObj) => {
  const d = dateObj || new Date();
  const day = d.getDate();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatGenTimestamp = (dateObj) => {
  const d = dateObj || new Date();
  const dateStr = formatDisplayDate(d);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${dateStr} at ${formattedHours}:${formattedMinutes} ${ampm}`;
};

const sanitizePdfText = (str = '') => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x00-\x7F]/g, '')
    .trim();
};

export async function generateDailyReportPdf(weatherBundle, cityName = 'Rajkot', reportDate = new Date()) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 32,
        bufferPages: true,
        autoFirstPage: true,
        autoPageBreak: false,
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const current = weatherBundle?.current || {};
      const forecast = weatherBundle?.forecast || [];
      const hourly = weatherBundle?.hourly || [];
      const airPollution = weatherBundle?.airPollution || null;
      const state = sanitizePdfText(weatherBundle?.state || current.sys?.state || '');

      const sys = current.sys || {};
      const main = current.main || {};
      const weatherArr = current.weather || [{}];
      const tzOffset = current.timezone !== undefined ? current.timezone : 19800;

      const rawCity = current.name || cityName;
      const city = sanitizePdfText(rawCity);
      const countryCode = sys.country || 'IN';
      const countryName = sanitizePdfText(Country.getCountryByCode(countryCode)?.name || countryCode);
      const locationParts = [city, state, countryName].filter(Boolean);
      const locationStr = locationParts.join(', ');
      const dateStr = formatDisplayDate(reportDate);

      const temp = Math.round(main.temp !== undefined ? main.temp : 30);
      const feelsLike = Math.round(main.feels_like !== undefined ? main.feels_like : 33);
      const condition = weatherArr[0]?.main || 'Clear';
      const conditionDesc = weatherArr[0]?.description || 'clear sky';

      let dayForecast = forecast.find(f => f.date === dateStr) || forecast[0];
      let high = dayForecast?.max;
      let low = dayForecast?.min;
      let pop = dayForecast?.pop;

      if (high === undefined || high === null) high = temp + 4;
      if (low === undefined || low === null) low = Math.max(15, temp - 3);
      if (pop === undefined || pop === null) pop = hourly[0]?.pop || 0;

      const isCurrentlyRaining = ['rain', 'drizzle', 'thunderstorm', 'squall'].includes(condition.toLowerCase()) || (current.rain && (current.rain['1h'] > 0 || current.rain['3h'] > 0));
      if (isCurrentlyRaining) pop = Math.max(pop || 0, 80);

      high = Math.max(temp, Math.round(high));
      low = Math.min(temp, Math.round(low));
      pop = Math.min(100, Math.max(0, Math.round(pop)));

      const humidity = main.humidity !== undefined ? main.humidity : 63;
      const windMps = current.wind?.speed !== undefined ? current.wind.speed : 4.19;
      const windKmh = Math.round(windMps * 3.6);
      const visibilityKm = current.visibility ? (current.visibility / 1000).toFixed(1) : '10.0';

      const sunrise = formatTime(sys.sunrise, tzOffset);
      const sunset = formatTime(sys.sunset, tzOffset);
      const aqiVal = airPollution?.aqi || 1;
      const aqiLabel = getAQIStatus(aqiVal);
      const uvVal = Math.min(11, Math.max(1, Math.round(temp / 4.5)));
      const uvLabel = getUVStatus(uvVal);

      // Monochrome Palette (Professional Black & White)
      const black = '#0f172a';
      const darkGrey = '#334155';
      const mutedGrey = '#64748b';
      const borderGrey = '#cbd5e1';
      const lightBg = '#f8fafc';

      const leftMargin = 32;
      const rightMargin = 563; // 595.28 - 32
      const contentWidth = 531;

      // ─── 1. HEADER SECTION ──────────────────────────────────────────
      doc.fillColor(black).fontSize(16).font('Helvetica-Bold').text('WEATHER NOTIFY', leftMargin, 28);
      doc.fillColor(mutedGrey).fontSize(9).font('Helvetica-Bold').text('DAILY WEATHER BULLETIN', rightMargin - 160, 30, { width: 160, align: 'right' });

      doc.fillColor(darkGrey).fontSize(12).font('Helvetica-Bold').text(locationStr, leftMargin, 48);
      doc.fillColor(mutedGrey).fontSize(9).font('Helvetica').text(dateStr, rightMargin - 150, 50, { width: 150, align: 'right' });

      // Line Separator
      doc.strokeColor(borderGrey).lineWidth(1).moveTo(leftMargin, 66).lineTo(rightMargin, 66).stroke();

      // ─── 2. TODAY'S WEATHER OVERVIEW (GRID) ────────────────────────
      let curY = 76;
      doc.fillColor(black).fontSize(10).font('Helvetica-Bold').text("TODAY'S WEATHER", leftMargin, curY);
      curY += 14;

      const gridBoxWidth = 126;
      const gridBoxHeight = 32;
      const gridGap = 9;

      const overviewItems = [
        { label: 'Condition', value: condition },
        { label: 'Temperature', value: `${low}°C – ${high}°C` },
        { label: 'Feels Like', value: `${feelsLike}°C` },
        { label: 'Humidity', value: `${humidity}%` },
        { label: 'Wind Speed', value: `${windKmh} km/h` },
        { label: 'Rain Chance', value: `${pop}%` },
        { label: 'Visibility', value: `${visibilityKm} km` },
        { label: 'AQI / UV', value: `AQI ${aqiVal} · UV ${uvVal}` },
      ];

      overviewItems.forEach((item, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        const bx = leftMargin + col * (gridBoxWidth + gridGap);
        const by = curY + row * (gridBoxHeight + gridGap);

        doc.rect(bx, by, gridBoxWidth, gridBoxHeight).fillAndStroke(lightBg, borderGrey);
        doc.fillColor(mutedGrey).fontSize(7).font('Helvetica').text(item.label.toUpperCase(), bx + 6, by + 4);
        doc.fillColor(black).fontSize(9.5).font('Helvetica-Bold').text(item.value, bx + 6, by + 16, { width: gridBoxWidth - 12, ellipsis: true });
      });

      curY += 2 * (gridBoxHeight + gridGap) + 10;

      // ─── 3. WEATHER SUMMARY ───────────────────────────────────────
      doc.fillColor(black).fontSize(10).font('Helvetica-Bold').text('WEATHER SUMMARY', leftMargin, curY);
      curY += 14;

      const rawTip = getWeatherTip({
        temp,
        condition,
        conditionDesc,
        pop,
        humidity,
        windSpeed: windMps,
        aqi: aqiVal,
        visibility: visibilityKm,
      }).replace(/^Tip:\s*/i, '');

      const summaryText = `Expect ${conditionDesc} with temperatures ranging from ${low}°C to ${high}°C today. ` +
        `Wind speeds average ${windKmh} km/h with relative humidity at ${humidity}%. ${rawTip}`;

      doc.rect(leftMargin, curY, contentWidth, 34).fillAndStroke(lightBg, borderGrey);
      doc.fillColor(darkGrey).fontSize(8).font('Helvetica').text(summaryText, leftMargin + 8, curY + 6, {
        width: contentWidth - 16,
        lineGap: 2,
      });

      curY += 44;

      // ─── 4. HOURLY FORECAST TABLE ──────────────────────────────────
      doc.fillColor(black).fontSize(10).font('Helvetica-Bold').text('HOURLY FORECAST', leftMargin, curY);
      curY += 14;

      const displayHourly = hourly.length >= 5 ? hourly.slice(0, 5) : [
        { time: '09:00 AM', temp, condition, pop },
        { time: '12:00 PM', temp: high, condition, pop },
        { time: '03:00 PM', temp: Math.max(low, high - 1), condition, pop },
        { time: '06:00 PM', temp: Math.max(low, temp - 1), condition, pop },
        { time: '09:00 PM', temp: low, condition, pop },
      ];

      doc.rect(leftMargin, curY, contentWidth, 16).fillAndStroke(lightBg, borderGrey);
      doc.fillColor(black).fontSize(7.5).font('Helvetica-Bold');
      doc.text('TIME', leftMargin + 8, curY + 4, { width: 90 });
      doc.text('TEMPERATURE', leftMargin + 110, curY + 4, { width: 100 });
      doc.text('CONDITION', leftMargin + 230, curY + 4, { width: 140 });
      doc.text('RAIN CHANCE', leftMargin + 380, curY + 4, { width: 140, align: 'right' });

      curY += 16;

      displayHourly.forEach((hSlot, i) => {
        const rowBg = i % 2 === 1 ? '#f8fafc' : '#ffffff';
        doc.rect(leftMargin, curY, contentWidth, 14).fillAndStroke(rowBg, borderGrey);
        doc.fillColor(darkGrey).fontSize(8).font('Helvetica');
        doc.text(hSlot.time || '--:--', leftMargin + 8, curY + 3, { width: 90 });
        doc.text(`${hSlot.temp}°C`, leftMargin + 110, curY + 3, { width: 100 });
        doc.text(hSlot.condition || 'Clear', leftMargin + 230, curY + 3, { width: 140 });
        doc.text(`${hSlot.pop || 0}%`, leftMargin + 380, curY + 3, { width: 140, align: 'right' });
        curY += 14;
      });

      curY += 10;

      // ─── 5. 5-DAY WEATHER FORECAST ────────────────────────────────
      doc.fillColor(black).fontSize(10).font('Helvetica-Bold').text('5-DAY OUTLOOK', leftMargin, curY);
      curY += 14;

      const displayForecast = forecast.slice(0, 5);
      doc.rect(leftMargin, curY, contentWidth, 16).fillAndStroke(lightBg, borderGrey);
      doc.fillColor(black).fontSize(7.5).font('Helvetica-Bold');
      doc.text('DAY & DATE', leftMargin + 8, curY + 4, { width: 110 });
      doc.text('TEMP RANGE', leftMargin + 120, curY + 4, { width: 100 });
      doc.text('CONDITION', leftMargin + 230, curY + 4, { width: 140 });
      doc.text('RAIN CHANCE', leftMargin + 380, curY + 4, { width: 140, align: 'right' });

      curY += 16;

      displayForecast.forEach((fSlot, i) => {
        const rowBg = i % 2 === 1 ? '#f8fafc' : '#ffffff';
        doc.rect(leftMargin, curY, contentWidth, 14).fillAndStroke(rowBg, borderGrey);
        doc.fillColor(darkGrey).fontSize(8).font('Helvetica');
        doc.text(`${fSlot.day || 'Day'}, ${fSlot.date || ''}`, leftMargin + 8, curY + 3, { width: 110 });
        doc.text(`${fSlot.min}°C – ${fSlot.max}°C`, leftMargin + 120, curY + 3, { width: 100 });
        doc.text(fSlot.condition || 'Clear', leftMargin + 230, curY + 3, { width: 140 });
        doc.text(`${fSlot.pop || 0}%`, leftMargin + 380, curY + 3, { width: 140, align: 'right' });
        curY += 14;
      });

      curY += 10;

      // ─── 6. WEATHER ALERTS ────────────────────────────────────────
      doc.fillColor(black).fontSize(10).font('Helvetica-Bold').text('WEATHER ADVISORY', leftMargin, curY);
      curY += 14;

      let alertTitle = '';
      let alertMessage = '';

      if (pop >= 70 || condition.toLowerCase().includes('rain')) {
        alertTitle = 'Rain Advisory';
        alertMessage = `High probability of rainfall (${pop}%) expected today. Carry an umbrella and exercise caution when traveling.`;
      } else if (temp >= 38) {
        alertTitle = 'Heat Advisory';
        alertMessage = `High temperatures (${temp}°C) expected. Stay hydrated and limit outdoor exposure during peak hours.`;
      } else if (windKmh >= 35) {
        alertTitle = 'Strong Wind Advisory';
        alertMessage = `Gusty winds up to ${windKmh} km/h expected. Secure loose outdoor objects and exercise caution.`;
      }

      if (alertTitle) {
        doc.rect(leftMargin, curY, contentWidth, 26).fillAndStroke(lightBg, borderGrey);
        doc.fillColor(black).fontSize(8).font('Helvetica-Bold').text(alertTitle, leftMargin + 8, curY + 4);
        doc.fillColor(darkGrey).fontSize(7.5).font('Helvetica').text(alertMessage, leftMargin + 8, curY + 14, { width: contentWidth - 16 });
        curY += 32;
      } else {
        doc.rect(leftMargin, curY, contentWidth, 20).fillAndStroke(lightBg, borderGrey);
        doc.fillColor(mutedGrey).fontSize(8).font('Helvetica').text('No severe weather advisories issued for today.', leftMargin + 8, curY + 6);
        curY += 26;
      }

      // ─── 7. SUN & AIR DETAILS ─────────────────────────────────────
      doc.fillColor(black).fontSize(10).font('Helvetica-Bold').text('SUN & AIR DETAILS', leftMargin, curY);
      curY += 14;

      doc.rect(leftMargin, curY, contentWidth, 22).fillAndStroke(lightBg, borderGrey);
      doc.fillColor(mutedGrey).fontSize(8).font('Helvetica');
      doc.text('Sunrise:', leftMargin + 8, curY + 6);
      doc.fillColor(black).font('Helvetica-Bold').text(sunrise, leftMargin + 46, curY + 6);

      doc.fillColor(mutedGrey).font('Helvetica').text('Sunset:', leftMargin + 130, curY + 6);
      doc.fillColor(black).font('Helvetica-Bold').text(sunset, leftMargin + 168, curY + 6);

      doc.fillColor(mutedGrey).font('Helvetica').text('Air Quality:', leftMargin + 260, curY + 6);
      doc.fillColor(black).font('Helvetica-Bold').text(aqiLabel, leftMargin + 312, curY + 6);

      doc.fillColor(mutedGrey).font('Helvetica').text('UV Index:', leftMargin + 420, curY + 6);
      doc.fillColor(black).font('Helvetica-Bold').text(uvLabel, leftMargin + 468, curY + 6);

      // ─── 8. FOOTER SECTION (STRICT 1-PAGE) ────────────────────────
      const footerY = 794;
      doc.strokeColor(borderGrey).lineWidth(1).moveTo(leftMargin, footerY - 6).lineTo(rightMargin, footerY - 6).stroke();

      doc.fillColor(mutedGrey).fontSize(7.5).font('Helvetica');
      doc.text('Weather Notify', leftMargin, footerY);
      doc.text(`Report generated on ${formatGenTimestamp(reportDate)}`, leftMargin + 80, footerY, { width: 280 });
      doc.text('Data provided by OpenWeather', rightMargin - 160, footerY, { width: 160, align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
