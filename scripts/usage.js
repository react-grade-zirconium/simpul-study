const USAGE_VISITOR_KEY = 'simpul_usage_visitor_id_v1';
const USAGE_ENDPOINT = './api/usage-event';

function getUsageVisitorId() {
  let visitorId = localStorage.getItem(USAGE_VISITOR_KEY);
  if (!visitorId) {
    const randomId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    visitorId = `visitor-${randomId}`;
    localStorage.setItem(USAGE_VISITOR_KEY, visitorId);
  }
  return visitorId;
}

function sendUsageEvent(type, details = {}) {
  const payload = {
    type,
    visitorId: getUsageVisitorId(),
    page: window.location.pathname.split('/').pop() || 'index.html',
    ...details
  };
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon(USAGE_ENDPOINT, blob)) return;
  }

  fetch(USAGE_ENDPOINT, {
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

window.SimpulUsage = { track: sendUsageEvent };

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUsageTracking);
} else {
  initUsageTracking();
}
