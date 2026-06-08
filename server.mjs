import express from 'express';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function loadDotEnvFile() {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '.env');
  if (!fsSync.existsSync(envPath)) return;
  const lines = fsSync.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

loadDotEnvFile();

const app = express();
const port = Number(process.env.PORT || 5000);
const host = process.env.HOST || '0.0.0.0';
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const usageDir = path.resolve(rootDir, process.env.USAGE_DATA_DIR || 'data');
const usageFile = path.resolve(usageDir, process.env.USAGE_DATA_FILE || 'usage-stats.json');
const staticAssetPattern = /\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/i;
const adminPassword = process.env.ADMIN_PASSWORD || 'simpul-admin';
const MAX_RECENT_EVENTS = 80;
const MAX_STUDY_MS_PER_EVENT = 6 * 60 * 60 * 1000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function getAllowedOrigin(origin) {
  if (allowedOrigins.includes('*')) return '*';
  if (origin && allowedOrigins.includes(origin)) return origin;
  return allowedOrigins[0] || '*';
}

app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', getAllowedOrigin(req.get('origin')));
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: '20kb', type: ['application/json', 'text/plain'] }));

function createEmptyUsageStats() {
  return {
    totals: {
      events: 0,
      pageViews: 0,
      portalViews: 0,
      startClicks: 0,
      subjectOpens: 0,
      activeMs: 0,
      visitors: 0
    },
    days: {},
    visitorIds: {},
    recentEvents: []
  };
}

async function ensureUsageStorage() {
  await fs.mkdir(usageDir, { recursive: true });
  try {
    await fs.access(usageFile);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeUsageStats(createEmptyUsageStats());
  }
}

async function readUsageStats() {
  try {
    const raw = await fs.readFile(usageFile, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      ...createEmptyUsageStats(),
      ...parsed,
      totals: { ...createEmptyUsageStats().totals, ...(parsed.totals || {}) }
    };
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Failed to read usage stats:', error);
    return createEmptyUsageStats();
  }
}

async function writeUsageStats(stats) {
  await fs.mkdir(usageDir, { recursive: true });
  await fs.writeFile(usageFile, `${JSON.stringify(stats, null, 2)}\n`, 'utf8');
}

function getDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function normalizeEventType(type) {
  const allowed = new Set(['page_view', 'start_study', 'portal_view', 'subject_open', 'active_time']);
  return allowed.has(type) ? type : 'custom';
}

function normalizeRequestBody(body) {
  if (typeof body !== 'string') return body || {};
  try {
    return JSON.parse(body);
  } catch (_) {
    return {};
  }
}

function sanitizeText(value, fallback = '') {
  return String(value || fallback).replace(/[<>]/g, '').slice(0, 90);
}

function sanitizeVisitorId(value) {
  const cleaned = String(value || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  return cleaned.length >= 8 ? cleaned : '';
}

function requireAdmin(req, res, next) {
  const headerPassword = req.get('x-admin-password') || '';
  const bearer = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (headerPassword === adminPassword || bearer === adminPassword) {
    next();
    return;
  }
  res.status(401).json({ ok: false, message: '관리자 인증이 필요합니다.' });
}

let usageWriteQueue = Promise.resolve();

function enqueueUsageUpdate(event) {
  usageWriteQueue = usageWriteQueue.then(async () => {
    const stats = await readUsageStats();
    const dayKey = getDayKey();
    const day = {
      pageViews: 0,
      portalViews: 0,
      startClicks: 0,
      subjectOpens: 0,
      activeMs: 0,
      visitors: {},
      subjects: {},
      ...(stats.days[dayKey] || {})
    };
    day.visitors = day.visitors || {};
    day.subjects = day.subjects || {};

    stats.totals.events += 1;
    if (event.visitorId) {
      stats.visitorIds[event.visitorId] = true;
      day.visitors[event.visitorId] = true;
      stats.totals.visitors = Object.keys(stats.visitorIds).length;
    }

    if (event.type === 'page_view') stats.totals.pageViews += 1;
    if (event.type === 'portal_view') stats.totals.portalViews += 1;
    if (event.type === 'start_study') stats.totals.startClicks += 1;
    if (event.type === 'subject_open') stats.totals.subjectOpens += 1;
    if (event.type === 'active_time') stats.totals.activeMs += event.activeMs;

    if (event.type === 'page_view') day.pageViews += 1;
    if (event.type === 'portal_view') day.portalViews += 1;
    if (event.type === 'start_study') day.startClicks += 1;
    if (event.type === 'subject_open') {
      day.subjectOpens += 1;
      const subject = event.subject || 'unknown';
      day.subjects[subject] = (day.subjects[subject] || 0) + 1;
    }
    if (event.type === 'active_time') day.activeMs += event.activeMs;

    stats.days[dayKey] = day;
    stats.recentEvents.unshift({
      type: event.type,
      page: event.page,
      subject: event.subject,
      activeMs: event.activeMs,
      at: new Date().toISOString()
    });
    stats.recentEvents = stats.recentEvents.slice(0, MAX_RECENT_EVENTS);
    await writeUsageStats(stats);
  }).catch((error) => {
    console.error('Failed to update usage stats:', error);
  });
  return usageWriteQueue;
}

function summarizeUsageStats(stats) {
  const days = Object.entries(stats.days || {})
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 14)
    .map(([date, day]) => ({
      date,
      pageViews: day.pageViews || 0,
      portalViews: day.portalViews || 0,
      startClicks: day.startClicks || 0,
      subjectOpens: day.subjectOpens || 0,
      activeMinutes: Math.round((day.activeMs || 0) / 60000),
      visitors: Object.keys(day.visitors || {}).length,
      subjects: day.subjects || {}
    }));

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    totals: {
      ...stats.totals,
      activeMinutes: Math.round((stats.totals.activeMs || 0) / 60000)
    },
    days,
    recentEvents: (stats.recentEvents || []).slice(0, 20)
  };
}

app.get('/api/health', async (req, res) => {
  try {
    await ensureUsageStorage();
    res.json({ ok: true, service: 'simpul-study', storage: 'ready' });
  } catch (_) {
    res.status(500).json({ ok: false, service: 'simpul-study', storage: 'error' });
  }
});

app.post('/api/usage-event', (req, res) => {
  const body = normalizeRequestBody(req.body);
  const type = normalizeEventType(body.type);
  const event = {
    type,
    page: sanitizeText(body.page, 'unknown'),
    subject: sanitizeText(body.subject, ''),
    visitorId: sanitizeVisitorId(body.visitorId),
    activeMs: Math.min(Math.max(Number(body.activeMs || 0), 0), MAX_STUDY_MS_PER_EVENT)
  };

  enqueueUsageUpdate(event);
  res.status(202).json({ ok: true });
});

app.get('/api/usage-stats', requireAdmin, async (req, res) => {
  const stats = await usageWriteQueue.then(readUsageStats);
  res.json(summarizeUsageStats(stats));
});

app.use(express.static(rootDir, {
  extensions: ['html'],
  setHeaders(res, filePath) {
    if (staticAssetPattern.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

async function startServer() {
  await ensureUsageStorage();
  if (adminPassword === 'simpul-admin') {
    console.warn('ADMIN_PASSWORD is not set. Using the local default password: simpul-admin');
  }
  app.listen(port, host, () => {
    console.log(`SIMPUL server listening on http://${host}:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start SIMPUL server:', error);
  process.exit(1);
});
