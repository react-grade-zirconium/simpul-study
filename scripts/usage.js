const USAGE_VISITOR_KEY = 'simpul_usage_visitor_id_v1';
const USAGE_LOCAL_STATS_KEY = 'simpul_usage_local_stats_v1';
const DEFAULT_USAGE_API_BASE = './api';
const MAX_LOCAL_RECENT_EVENTS = 40;

function createEmptyLocalUsageStats() {
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

function getUsageVisitorId() {
  let visitorId = localStorage.getItem(USAGE_VISITOR_KEY);
  if (!visitorId) {
    const randomId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    visitorId = `visitor-${randomId}`;
    localStorage.setItem(USAGE_VISITOR_KEY, visitorId);
  }
  return visitorId;
}

function getDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function readLocalUsageStats() {
  try {
    const raw = localStorage.getItem(USAGE_LOCAL_STATS_KEY);
    if (!raw) return createEmptyLocalUsageStats();
    const parsed = JSON.parse(raw);
    return {
      ...createEmptyLocalUsageStats(),
      ...parsed,
      totals: { ...createEmptyLocalUsageStats().totals, ...(parsed.totals || {}) }
    };
  } catch (_) {
    return createEmptyLocalUsageStats();
  }
}

function writeLocalUsageStats(stats) {
  localStorage.setItem(USAGE_LOCAL_STATS_KEY, JSON.stringify(stats));
}

function recordLocalUsageEvent(event) {
  const stats = readLocalUsageStats();
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
  if (event.type === 'active_time') stats.totals.activeMs += event.activeMs || 0;

  if (event.type === 'page_view') day.pageViews += 1;
  if (event.type === 'portal_view') day.portalViews += 1;
  if (event.type === 'start_study') day.startClicks += 1;
  if (event.type === 'subject_open') {
    day.subjectOpens += 1;
    const subject = event.subject || 'unknown';
    day.subjects[subject] = (day.subjects[subject] || 0) + 1;
  }
  if (event.type === 'active_time') day.activeMs += event.activeMs || 0;

  stats.days[dayKey] = day;
  stats.recentEvents.unshift({
    type: event.type,
    page: event.page,
    subject: event.subject,
    activeMs: event.activeMs || 0,
    at: new Date().toISOString()
  });
  stats.recentEvents = stats.recentEvents.slice(0, MAX_LOCAL_RECENT_EVENTS);
  writeLocalUsageStats(stats);
}

function summarizeLocalUsageStats() {
  const stats = readLocalUsageStats();
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
    source: 'local',
    generatedAt: new Date().toISOString(),
    totals: {
      ...stats.totals,
      activeMinutes: Math.round((stats.totals.activeMs || 0) / 60000)
    },
    days,
    recentEvents: (stats.recentEvents || []).slice(0, 20)
  };
}

function getUsageApiBase() {
  const configured = document.querySelector('meta[name="simpul-api-base"]')?.content?.trim();
  return configured || window.SIMPUL_API_BASE || DEFAULT_USAGE_API_BASE;
}

function getUsageApiUrl(path) {
  return `${String(getUsageApiBase()).replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

async function checkUsageServer() {
  const response = await fetch(getUsageApiUrl('health'), { cache: 'no-store' });
  if (!response.ok) throw new Error('Usage server health check failed');
  return response.json();
}

function sendUsageEvent(type, details = {}) {
  const payload = {
    type,
    visitorId: getUsageVisitorId(),
    page: window.location.pathname.split('/').pop() || 'index.html',
    ...details
  };
  const body = JSON.stringify(payload);
  recordLocalUsageEvent(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon(getUsageApiUrl('usage-event'), blob)) return;
  }

  fetch(getUsageApiUrl('usage-event'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => {});
}

let activeStartedAt = Date.now();

function flushActiveTime() {
  const now = Date.now();
  const activeMs = now - activeStartedAt;
  activeStartedAt = now;
  if (activeMs < 3000) return;
  sendUsageEvent('active_time', { activeMs });
}

function initUsageTracking() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  sendUsageEvent(page === 'portal.html' ? 'portal_view' : 'page_view');
  document.querySelectorAll('[data-usage-event]').forEach((el) => {
    el.addEventListener('click', () => {
      sendUsageEvent(el.dataset.usageEvent, { subject: el.dataset.usageSubject || '' });
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushActiveTime();
    if (document.visibilityState === 'visible') activeStartedAt = Date.now();
  });
  window.addEventListener('beforeunload', flushActiveTime);
}

window.SimpulUsage = {
  checkServer: checkUsageServer,
  getApiUrl: getUsageApiUrl,
  getLocalStats: summarizeLocalUsageStats,
  track: sendUsageEvent
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUsageTracking);
} else {
  initUsageTracking();
}
