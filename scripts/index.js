const line1 = document.getElementById('line1');
const line2 = document.getElementById('line2');
const finalLine = document.getElementById('finalLine');

const FIRST_FULL = '심규원·최시원의';
const SECOND_FULL = '풀서비스 스터디';
const FINAL_TEXT = '심풀 스터디';

function getLineTargetWidth(el) {
  const parentWidth = el.parentElement ? el.parentElement.clientWidth : window.innerWidth;
  return Math.min(el.scrollWidth + 4, Math.max(0, parentWidth));
}

function typeTo(el, text, duration = 900) {
  if (!el) return;
  el.classList.add('typing');
  el.textContent = text;
  el.style.maxWidth = '0px';
  requestAnimationFrame(() => {
    const target = getLineTargetWidth(el);
    el.style.transition = `max-width ${duration}ms steps(${Math.max(text.length, 6)}, end)`;
    el.style.maxWidth = `${target}px`;
  });
}

function freeze(el) {
  if (!el) return;
  el.classList.remove('typing');
  el.style.transition = 'none';
  el.style.maxWidth = 'none';
  el.style.borderRight = 'none';
}

function reduceFirstLineToShim() {
  if (!line1) return;
  line1.innerHTML = '<span id="shimCore" class="shim-core morph-piece">심</span><span id="fadeName" class="fade-name">규원·최시원의</span>';
}

function removeServiceFromSecondLine() {
  if (!line2) return;
  line2.innerHTML = '<span id="leftKeep" class="left-keep morph-piece">풀</span><span id="fadeService" class="fade-service">서비스</span><span class="line-gap" aria-hidden="true">&nbsp;</span><span id="rightKeep" class="right-keep morph-piece">스터디</span>';
}

function showFinalMergedLine() {
  if (!finalLine) return;
  finalLine.textContent = FINAL_TEXT;
  finalLine.classList.add('show-final');
}

function prepareMorphPieces() {
  document.querySelector('.hero')?.classList.add('morphing');
  document.getElementById('fadeName')?.classList.add('hide');
  document.getElementById('fadeService')?.classList.add('hide');
}

function morphIntoFinalLine() {
  document.querySelector('.hero')?.classList.add('collapse-lines');
  setTimeout(() => { showFinalMergedLine(); }, 300);
}

if (finalLine) {
  finalLine.textContent = '';
  finalLine.classList.remove('show-final');
}

typeTo(line1, FIRST_FULL, 900);
setTimeout(() => { freeze(line1); typeTo(line2, SECOND_FULL, 850); }, 1100);
setTimeout(() => { freeze(line2); }, 2100);
setTimeout(() => { reduceFirstLineToShim(); removeServiceFromSecondLine(); }, 3600);
setTimeout(() => { prepareMorphPieces(); }, 3850);
setTimeout(() => { morphIntoFinalLine(); }, 5200);

function formatUsageMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0분';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}시간 ${rest}분` : `${rest}분`;
}

function renderUsageStats(stats) {
  const summaryEl = document.getElementById('usageSummary');
  const dailyEl = document.getElementById('usageDaily');
  if (!summaryEl || !dailyEl) return;
  const totals = stats.totals || {};
  summaryEl.innerHTML = [
    ['방문 학생', `${totals.visitors || 0}명`],
    ['첫 화면 조회', `${totals.pageViews || 0}회`],
    ['학습 시작', `${totals.startClicks || 0}회`],
    ['포털 접속', `${totals.portalViews || 0}회`],
    ['과목 열람', `${totals.subjectOpens || 0}회`],
    ['누적 이용 시간', formatUsageMinutes(totals.activeMinutes || 0)]
  ].map(([label, value]) => `<div class="usage-stat-card"><span>${label}</span><strong>${value}</strong></div>`).join('');

  const days = stats.days || [];
  if (!days.length) {
    dailyEl.innerHTML = '<p class="usage-empty">아직 기록된 이용 현황이 없습니다.</p>';
    return;
  }
  dailyEl.innerHTML = days.map((day) => {
    const subjects = Object.entries(day.subjects || {})
      .sort((a, b) => b[1] - a[1])
      .map(([subject, count]) => `${subject} ${count}회`)
      .join(' · ') || '과목 기록 없음';
    return `<article class="usage-day-card">
      <div><strong>${day.date}</strong><span>${day.visitors}명 이용</span></div>
      <p>첫 화면 ${day.pageViews}회 · 포털 ${day.portalViews}회 · 학습 시작 ${day.startClicks}회</p>
      <p>과목 ${day.subjectOpens}회 · 이용 시간 ${formatUsageMinutes(day.activeMinutes || 0)}</p>
      <small>${subjects}</small>
    </article>`;
  }).join('');
}

function initAdminUsageWidget() {
  const toggleBtn = document.getElementById('adminToggleBtn');
  const panel = document.getElementById('adminPanel');
  const form = document.getElementById('adminLoginForm');
  const passwordInput = document.getElementById('adminPasswordInput');
  const messageEl = document.getElementById('adminMessage');
  const statsPanel = document.getElementById('usageStatsPanel');
  const refreshBtn = document.getElementById('usageRefreshBtn');
  if (!toggleBtn || !panel || !form || !passwordInput || !messageEl || !statsPanel || !refreshBtn) return;

  let adminPassword = '';

  function setMessage(text, isError = false) {
    messageEl.textContent = text;
    messageEl.classList.toggle('error', isError);
  }

  function renderLocalStatsFallback() {
    const localStats = window.SimpulUsage?.getLocalStats?.();
    if (!localStats) {
      setMessage('이용 현황을 불러올 수 없습니다.', true);
      statsPanel.hidden = true;
      return;
    }
    renderUsageStats(localStats);
    statsPanel.hidden = false;
    setMessage('전체 학생 통계 서버에 연결되지 않아 이 기기의 기록만 표시 중입니다.', true);
  }

  async function loadStats() {
    if (!adminPassword) return;
    setMessage('이용 현황을 불러오는 중입니다...');
    try {
      const response = await fetch('./api/usage-stats', {
        headers: { 'x-admin-password': adminPassword }
      });
      const stats = await response.json();
      if (!response.ok || !stats.ok) {
        setMessage(stats.message || '인증에 실패했습니다.', true);
        statsPanel.hidden = true;
        return;
      }
      renderUsageStats(stats);
      statsPanel.hidden = false;
      setMessage(`전체 학생 통계 · 최근 업데이트: ${new Date(stats.generatedAt).toLocaleString('ko-KR')}`);
    } catch (_) {
      renderLocalStatsFallback();
    }
  }

  toggleBtn.addEventListener('click', () => {
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    toggleBtn.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) passwordInput.focus();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    adminPassword = passwordInput.value.trim();
    if (!adminPassword) {
      setMessage('관리자 비밀번호를 입력해 주세요.', true);
      return;
    }
    loadStats();
  });

  refreshBtn.addEventListener('click', loadStats);
}

initAdminUsageWidget();
