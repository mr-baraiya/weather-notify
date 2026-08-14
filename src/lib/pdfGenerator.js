import PDFDocument from 'pdfkit';
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

export async function generateDailyReportPdf(weatherBundle, cityName = 'Rajkot', reportDate = new Date()) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 36,
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
      const state = weatherBundle?.state || current.sys?.state || '';

      const sys = current.sys || {};
      const main = current.main || {};
      const weatherArr = current.weather || [{}];
      const tzOffset = current.timezone !== undefined ? current.timezone : 19800;

      const city = current.name || cityName;
      const locationStr = state ? `${city}, ${state}` : city;
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

      // Colors
      const primaryColor = '#2563eb'; // Weather Notify Accent Blue
      const darkColor = '#0f172a';
      const bodyColor = '#334155';
      const mutedColor = '#64748b';
      const borderColor = '#e2e8f0';
      const lightBg = '#f8fafc';

      const leftMargin = 36;
      const rightMargin = 559; // 595 - 36
      const contentWidth = 523;

      let y = 36;

      // ─── 1. HEADER SECTION ──────────────────────────────────────────
      doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('Weather Notify', leftMargin, y);
      doc.fillColor(mutedColor).fontSize(12).font('Helvetica').text('Daily Weather Report', rightMargin - 150, y, { width: 150, align: 'right' });
      y += 24;

      doc.fillColor(darkColor).fontSize(16).font('Helvetica-Bold').text(locationStr, leftMargin, y);
      doc.fillColor(bodyColor).fontSize(11).font('Helvetica').text(dateStr, rightMargin - 150, y, { width: 150, align: 'right' });
      y += 24;

      // Divider Line
      doc.strokeColor(borderColor).lineWidth(1).moveTo(leftMargin, y).lineTo(rightMargin, y).stroke();
      y += 16;

      // ─── 2. TODAY'S WEATHER OVERVIEW (GRID) ────────────────────────
      doc.fillColor(darkColor).fontSize(13).font('Helvetica-Bold').text("Today's Weather", leftMargin, y);
      y += 18;

      const gridBoxWidth = 124;
      const gridBoxHeight = 44;
      const gridGap = 9;

      const overviewItems = [
        { label: 'Condition', value: condition },
        { label: 'Temperature', value: `${low}°C – ${high}°C` },
        { label: 'Feels Like', value: `${feelsLike}°C` },
        { label: 'Humidity', value: `${humidity}%` },
        { label: 'Wind Speed', value: `${windKmh} km/h` },
        { label: 'Rain Probability', value: `${pop}%` },
        { label: 'Visibility', value: `${visibilityKm} km` },
        { label: 'UV Index', value: uvLabel },
      ];

      overviewItems.forEach((item, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        const bx = leftMargin + col * (gridBoxWidth + gridGap);
        const by = y + row * (gridBoxHeight + gridGap);

        doc.rect(bx, by, gridBoxWidth, gridBoxHeight).fillAndStroke(lightBg, borderColor);
        doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text(item.label.toUpperCase(), bx + 8, by + 7);
        doc.fillColor(darkColor).fontSize(11).font('Helvetica-Bold').text(item.value, bx + 8, by + 22, { width: gridBoxWidth - 16, ellipsis: true });
      });

      y += 2 * (gridBoxHeight + gridGap) + 12;

      // ─── 3. WEATHER SUMMARY ───────────────────────────────────────
      doc.fillColor(darkColor).fontSize(13).font('Helvetica-Bold').text('Weather Summary', leftMargin, y);
      y += 16;

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

      let summaryText = `Expect ${conditionDesc} with temperatures ranging from a low of ${low}°C to a high of ${high}°C today. ` +
        `Wind speeds will average around ${windKmh} km/h with relative humidity at ${humidity}%. ${rawTip}`;

      doc.rect(leftMargin, y, contentWidth, 52).fillAndStroke('#eff6ff', '#bfdbfe');
      doc.fillColor('#1e40af').fontSize(10).font('Helvetica').text(summaryText, leftMargin + 12, y + 10, {
        width: contentWidth - 24,
        lineGap: 3,
      });

      y += 64;

      // ─── 4. HOURLY FORECAST TABLE ──────────────────────────────────
      doc.fillColor(darkColor).fontSize(13).font('Helvetica-Bold').text('Hourly Forecast', leftMargin, y);
      y += 16;

      // Select 5-6 representative hours (e.g. slots 0, 1, 2, 3, 4, 5 from hourly array)
      const displayHourly = hourly.length >= 5 ? hourly.slice(0, 5) : [
        { time: '09:00 AM', temp, condition, pop },
        { time: '12:00 PM', temp: high, condition, pop },
        { time: '03:00 PM', temp: Math.max(low, high - 1), condition, pop },
        { time: '06:00 PM', temp: Math.max(low, temp - 1), condition, pop },
        { time: '09:00 PM', temp: low, condition, pop },
      ];

      // Table Header
      const tableY = y;
      doc.rect(leftMargin, tableY, contentWidth, 24).fillAndStroke(lightBg, borderColor);
      doc.fillColor(darkColor).fontSize(9).font('Helvetica-Bold');
      doc.text('TIME', leftMargin + 12, tableY + 7, { width: 100 });
      doc.text('TEMPERATURE', leftMargin + 120, tableY + 7, { width: 100 });
      doc.text('CONDITION', leftMargin + 240, tableY + 7, { width: 140 });
      doc.text('RAIN CHANCE', leftMargin + 390, tableY + 7, { width: 115, align: 'right' });

      y += 24;

      displayHourly.forEach((hSlot, i) => {
        const rowBg = i % 2 === 1 ? '#f8fafc' : '#ffffff';
        doc.rect(leftMargin, y, contentWidth, 22).fillAndStroke(rowBg, borderColor);
        doc.fillColor(bodyColor).fontSize(9.5).font('Helvetica');
        doc.text(hSlot.time || '--:--', leftMargin + 12, y + 6, { width: 100 });
        doc.text(`${hSlot.temp}°C`, leftMargin + 120, y + 6, { width: 100 });
        doc.text(hSlot.condition || 'Clear', leftMargin + 240, y + 6, { width: 140 });
        doc.text(`${hSlot.pop || 0}%`, leftMargin + 390, y + 6, { width: 115, align: 'right' });
        y += 22;
      });

      y += 14;

      // ─── 5. 5-DAY WEATHER FORECAST ────────────────────────────────
      doc.fillColor(darkColor).fontSize(12).font('Helvetica-Bold').text('5-Day Outlook', leftMargin, y);
      y += 14;

      const displayForecast = forecast.slice(0, 5);
      const fTableY = y;
      doc.rect(leftMargin, fTableY, contentWidth, 20).fillAndStroke(lightBg, borderColor);
      doc.fillColor(darkColor).fontSize(8.5).font('Helvetica-Bold');
      doc.text('DAY & DATE', leftMargin + 10, fTableY + 5, { width: 110 });
      doc.text('TEMP RANGE', leftMargin + 125, fTableY + 5, { width: 110 });
      doc.text('CONDITION', leftMargin + 240, fTableY + 5, { width: 140 });
      doc.text('RAIN CHANCE', leftMargin + 390, fTableY + 5, { width: 115, align: 'right' });

      y += 20;

      displayForecast.forEach((fSlot, i) => {
        const rowBg = i % 2 === 1 ? '#f8fafc' : '#ffffff';
        doc.rect(leftMargin, y, contentWidth, 18).fillAndStroke(rowBg, borderColor);
        doc.fillColor(bodyColor).fontSize(8.5).font('Helvetica');
        doc.text(`${fSlot.day || 'Day'}, ${fSlot.date || ''}`, leftMargin + 10, y + 4, { width: 110 });
        doc.text(`${fSlot.min}°C – ${fSlot.max}°C`, leftMargin + 125, y + 4, { width: 110 });
        doc.text(fSlot.condition || 'Clear', leftMargin + 240, y + 4, { width: 140 });
        doc.text(`${fSlot.pop || 0}%`, leftMargin + 390, y + 4, { width: 115, align: 'right' });
        y += 18;
      });

      y += 14;

      // ─── 6. WEATHER ALERTS SECTION ─────────────────────────────────
      doc.fillColor(darkColor).fontSize(13).font('Helvetica-Bold').text('Weather Alerts', leftMargin, y);
      y += 16;

      let alertTitle = '';
      let alertMessage = '';

      if (pop >= 70 || condition.toLowerCase().includes('rain')) {
        alertTitle = 'Rain Advisory';
        alertMessage = `High probability of rainfall (${pop}%) expected today. Carry an umbrella and exercise caution when traveling.`;
      } else if (temp >= 38) {
        alertTitle = 'Heat Advisory';
        alertMessage = `High temperatures (${temp}°C) expected. Stay hydrated and limit prolonged outdoor exposure during peak afternoon hours.`;
      } else if (windKmh >= 35) {
        alertTitle = 'Strong Wind Advisory';
        alertMessage = `Gusty winds up to ${windKmh} km/h expected. Secure loose outdoor objects and exercise caution.`;
      }

      if (alertTitle) {
        doc.rect(leftMargin, y, contentWidth, 42).fillAndStroke('#fff7ed', '#ffedd5');
        doc.fillColor('#c2410c').fontSize(10).font('Helvetica-Bold').text(alertTitle, leftMargin + 12, y + 8);
        doc.fillColor('#9a3412').fontSize(9).font('Helvetica').text(alertMessage, leftMargin + 12, y + 22, { width: contentWidth - 24 });
        y += 52;
      } else {
        doc.rect(leftMargin, y, contentWidth, 28).fillAndStroke('#f8fafc', borderColor);
        doc.fillColor(mutedColor).fontSize(9.5).font('Helvetica').text('No significant weather alerts today.', leftMargin + 12, y + 8);
        y += 38;
      }

      // ─── 6. SUNRISE / SUNSET & EXTRAS ──────────────────────────────
      doc.fillColor(darkColor).fontSize(13).font('Helvetica-Bold').text('Sun & Air Details', leftMargin, y);
      y += 16;

      doc.rect(leftMargin, y, contentWidth, 34).fillAndStroke(lightBg, borderColor);
      doc.fillColor(mutedColor).fontSize(9.5).font('Helvetica');
      doc.text('Sunrise:', leftMargin + 12, y + 10);
      doc.fillColor(darkColor).font('Helvetica-Bold').text(sunrise, leftMargin + 56, y + 10);

      doc.fillColor(mutedColor).font('Helvetica').text('Sunset:', leftMargin + 140, y + 10);
      doc.fillColor(darkColor).font('Helvetica-Bold').text(sunset, leftMargin + 182, y + 10);

      doc.fillColor(mutedColor).font('Helvetica').text('Air Quality:', leftMargin + 270, y + 10);
      doc.fillColor(darkColor).font('Helvetica-Bold').text(aqiLabel, leftMargin + 330, y + 10);

      y += 46;

      // ─── 7. FOOTER SECTION ─────────────────────────────────────────
      const footerY = 790; // Fixed footer position near bottom of A4 (841pt total)
      doc.strokeColor(borderColor).lineWidth(1).moveTo(leftMargin, footerY - 10).lineTo(rightMargin, footerY - 10).stroke();

      doc.fillColor(mutedColor).fontSize(8.5).font('Helvetica');
      doc.text('Weather Notify', leftMargin, footerY);
      doc.text(`Today's report generated on ${formatGenTimestamp(reportDate)}`, leftMargin + 90, footerY, { width: 300 });
      doc.text('Weather data provided by OpenWeather', rightMargin - 180, footerY, { width: 180, align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
