import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import { getFullWeatherData } from './weather.js';
import { generateDailyReportPdf } from './pdfGenerator.js';

const pendingGenerations = new Map();

export const slugifyCity = (city = '') =>
  city
    .toString()
    .toLowerCase()
    .split(',')[0]
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'default';

export const getReportDateStr = (dateObj) => {
  const d = dateObj || new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Gets cached PDF buffer or generates a single 1-page A4 PDF report for location + date
 */
export async function getOrGeneratePdfReport(cityName = 'Rajkot', targetDateStr = null) {
  const citySlug = slugifyCity(cityName);
  const dateStr = targetDateStr || getReportDateStr(new Date());
  const cacheKey = `${citySlug}/${dateStr}`;

  // Local Disk Storage Path
  const dirPath = path.join(process.cwd(), 'public', 'reports', citySlug);
  const filePath = path.join(dirPath, `${dateStr}.pdf`);

  // 1. Check if cached PDF file already exists on local disk
  if (fs.existsSync(filePath)) {
    try {
      const cachedBuffer = fs.readFileSync(filePath);
      if (cachedBuffer && cachedBuffer.length > 0) {
        return { buffer: cachedBuffer, key: cacheKey, citySlug, dateStr, fromCache: true };
      }
    } catch (err) {
      console.warn(`Failed reading cached PDF at ${filePath}:`, err.message);
    }
  }

  // 2. Prevent duplicate simultaneous PDF generation calls for the same key
  if (pendingGenerations.has(cacheKey)) {
    const buffer = await pendingGenerations.get(cacheKey);
    return { buffer, key: cacheKey, citySlug, dateStr, fromCache: true };
  }

  // 3. Generate PDF & Save to Cache
  const generationPromise = (async () => {
    const weatherBundle = await getFullWeatherData(cityName);
    const reportDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const pdfBuffer = await generateDailyReportPdf(weatherBundle, cityName, reportDate);

    // Save to local disk cache
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(filePath, pdfBuffer);
    } catch (fsErr) {
      console.error(`Failed to write PDF cache to ${filePath}:`, fsErr.message);
    }

    // Backup to Vercel Blob if token is available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blobPath = `reports/${citySlug}/${dateStr}.pdf`;
        await put(blobPath, pdfBuffer, { access: 'public' });
      } catch (blobErr) {
        console.warn('Vercel Blob upload warning:', blobErr.message);
      }
    }

    return pdfBuffer;
  })();

  pendingGenerations.set(cacheKey, generationPromise);

  try {
    const pdfBuffer = await generationPromise;
    return { buffer: pdfBuffer, key: cacheKey, citySlug, dateStr, fromCache: false };
  } finally {
    pendingGenerations.delete(cacheKey);
  }
}
