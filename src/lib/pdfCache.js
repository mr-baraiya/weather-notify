import fs from 'fs';
import path from 'path';
import os from 'os';
import { put, list } from '@vercel/blob';
import { getFullWeatherData, cleanCityQuery } from './weather.js';
import { generateDailyReportPdf } from './pdfGenerator.js';

const pendingGenerations = new Map();
const inMemoryCache = new Map();

export const slugifyCity = (city = '') => {
  const cleaned = cleanCityQuery(city);
  return (
    cleaned
      .toString()
      .toLowerCase()
      .split(',')[0]
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'default'
  );
};

export const getReportDateStr = (dateObj) => {
  const d = dateObj || new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Gets cached PDF buffer or generates a single 1-page A4 PDF report for location + date.
 * Uses Vercel Blob storage (cloud) and OS temporary directory (local fallback).
 */
export async function getOrGeneratePdfReport(cityName = 'Rajkot', targetDateStr = null, forceFresh = false) {
  const citySlug = slugifyCity(cityName);
  const dateStr = targetDateStr || getReportDateStr(new Date());
  const cacheKey = `${citySlug}/${dateStr}`;
  const blobPath = `reports/${citySlug}/${dateStr}.pdf`;

  // 1. In-Memory Cache check
  if (!forceFresh && inMemoryCache.has(cacheKey)) {
    return { buffer: inMemoryCache.get(cacheKey), key: cacheKey, citySlug, dateStr, fromCache: true };
  }

  // 2. Temp OS Directory Storage Path (avoids polluting public/ or failing on read-only serverless filesystems)
  const tempDir = path.join(os.tmpdir(), 'weather-notify-reports', citySlug);
  const tempFilePath = path.join(tempDir, `${dateStr}.pdf`);

  if (!forceFresh && fs.existsSync(tempFilePath)) {
    try {
      const cachedBuffer = fs.readFileSync(tempFilePath);
      if (cachedBuffer && cachedBuffer.length > 0) {
        inMemoryCache.set(cacheKey, cachedBuffer);
        return { buffer: cachedBuffer, key: cacheKey, citySlug, dateStr, fromCache: true };
      }
    } catch (err) {
      console.warn(`Failed reading temp cached PDF at ${tempFilePath}:`, err.message);
    }
  }

  // 3. Vercel Blob Cloud Cache lookup (if token is available)
  if (!forceFresh && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: blobPath, limit: 1 });
      const foundBlob = blobs.find((b) => b.pathname === blobPath);
      if (foundBlob) {
        const res = await fetch(foundBlob.url);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          inMemoryCache.set(cacheKey, buffer);
          return { buffer, key: cacheKey, citySlug, dateStr, fromCache: true, blobUrl: foundBlob.url };
        }
      }
    } catch (blobErr) {
      console.warn('Vercel Blob cache lookup warning:', blobErr.message);
    }
  }

  // 4. Prevent duplicate simultaneous PDF generation calls for the same key
  if (pendingGenerations.has(cacheKey)) {
    const buffer = await pendingGenerations.get(cacheKey);
    return { buffer, key: cacheKey, citySlug, dateStr, fromCache: true };
  }

  // 5. Generate PDF & Save to Cache / Vercel Blob
  const generationPromise = (async () => {
    const weatherBundle = await getFullWeatherData(cityName);
    const reportDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const pdfBuffer = await generateDailyReportPdf(weatherBundle, cityName, reportDate);

    // Cache in memory
    inMemoryCache.set(cacheKey, pdfBuffer);

    // Save to OS temp directory fallback
    try {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      fs.writeFileSync(tempFilePath, pdfBuffer);
    } catch (fsErr) {
      console.warn(`Failed to write temp PDF cache to ${tempFilePath}:`, fsErr.message);
    }

    // Upload to Vercel Blob cloud storage if token is available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await put(blobPath, pdfBuffer, {
          access: 'public',
          addRandomSuffix: false, // Maintain fixed URL path for city + date
        });
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

