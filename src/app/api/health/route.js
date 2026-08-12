import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbLatencyMs = null;
  let isHealthy = true;

  try {
    const dbStartTime = Date.now();
    await connectToDatabase();
    dbLatencyMs = Date.now() - dbStartTime;

    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const stateCode = mongoose.connection.readyState;
    dbStatus = stateMap[stateCode] || 'unknown';

    if (stateCode !== 1 && stateCode !== 2) {
      isHealthy = false;
    }
  } catch (error) {
    console.error('Health check database error:', error);
    dbStatus = 'error';
    isHealthy = false;
  }

  const responseTimeMs = Date.now() - startTime;
  const status = isHealthy ? 'ok' : 'degraded';
  const httpStatus = isHealthy ? 200 : 503;

  const healthData = {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: `${responseTimeMs}ms`,
    services: {
      database: {
        status: dbStatus,
        latency: dbLatencyMs !== null ? `${dbLatencyMs}ms` : undefined,
      },
      environment: process.env.NODE_ENV || 'development',
    },
  };

  return new Response(JSON.stringify(healthData), {
    status: httpStatus,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
