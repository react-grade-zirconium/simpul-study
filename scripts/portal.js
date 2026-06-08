function removeUnexpectedBodyTextNodes() {
  const nodes = Array.from(document.body.childNodes);
  for (const node of nodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    if (!node.textContent) continue;
    if (node.textContent.trim() === '') continue;
    node.remove();
  }
}
removeUnexpectedBodyTextNodes();


const MOBILE_LITE_QUERY = '(max-width: 900px), (pointer: coarse) and (max-width: 1024px)';
function isMobileLiteMode() {
  return Boolean(window.matchMedia?.(MOBILE_LITE_QUERY).matches);
}
const title = document.getElementById('title');
const desc = document.getElementById('desc');
const dashPanel = document.getElementById('dashPanel');
const framePanel = document.getElementById('framePanel');
const versionPanel = document.getElementById('versionPanel');
const aiCoachPanel = document.getElementById('aiCoachPanel');
const frame = document.getElementById('frame');
const subjectToggleBtn = document.getElementById('subjectToggleBtn');
const versionToggleBtn = document.getElementById('versionToggleBtn');
const ddayEl = document.getElementById('ddayValue');
const goalInput = document.getElementById('goalInput');
const goalSaveBtn = document.getElementById('goalSaveBtn');
const goalValueEl = document.getElementById('goalValue');
const goalMsgEl = document.getElementById('goalMsg');
const memoInput = document.getElementById('memoInput');
const memoSaveBtn = document.getElementById('memoSaveBtn');
const memoMsgEl = document.getElementById('memoMsg');
const aiSourceInput = document.getElementById('aiSourceInput');
const aiAnalyzeBtn = document.getElementById('aiAnalyzeBtn');
const aiAnalyzeFrameBtn = document.getElementById('aiAnalyzeFrameBtn');
const aiSubjectSelect = document.getElementById('aiSubjectSelect');
const aiGenerateSubjectBtn = document.getElementById('aiGenerateSubjectBtn');
const aiMsgEl = document.getElementById('aiMsg');
const aiSummaryEl = document.getElementById('aiSummary');
const aiQuestionListEl = document.getElementById('aiQuestionList');
const aiQuizCardsEl = document.getElementById('aiQuizCards');
const aiPracticeCardEl = document.getElementById('aiPracticeCard');
const aiPracticeProgressEl = document.getElementById('aiPracticeProgress');
const aiPrevQuestionBtn = document.getElementById('aiPrevQuestionBtn');
const aiNextQuestionBtn = document.getElementById('aiNextQuestionBtn');
const aiMoreQuestionsBtn = document.getElementById('aiMoreQuestionsBtn');

const FINAL_EXAM_DATE = '2026-06-29';
const GOAL_STORAGE_KEY = 'studymax_personal_goal';
const MEMO_STORAGE_KEY = 'studymax_today_memo';
const PROFILE_NAME_KEY = 'studymax_profile_name';
const PROFILE_CLASS_KEY = 'studymax_profile_class';
const PROFILE_NUMBER_KEY = 'studymax_profile_number';
const PROFILE_PHOTO_KEY = 'studymax_profile_photo';
const AI_CONTENT_BANK_KEY = 'studymax_ai_content_bank_v1';
const AI_QUESTIONS_KEY = 'studymax_ai_questions_v1';
const AI_ACTIVE_SOURCE_KEY = 'studymax_ai_active_source_v1';
const AI_ACTIVE_SUBJECT_KEY = 'studymax_ai_active_subject_v1';
const AI_ROUND_KEY = 'studymax_ai_round_v1';
const AI_ACTIVE_INDEX_KEY = 'studymax_ai_active_index_v1';
const AI_WIDGET_POSITION_KEY = 'studymax_ai_widget_position_v1';
const SIDEBAR_COLLAPSED_KEY = 'studymax_subject_sidebar_collapsed';
const SUBJECT_TAB_INK_SCOPE_NOTE = 'Dashboard, each subject, and each in-subject tab must keep separate ink storage whenever a subject adds tabbed content.';
const subjectTextCache = new Map();
const AI_SUBJECTS = {
  korean: { label: '국어', src: 'korean_hub.html', fallback: '국어 문학, 독서, 문법 핵심 개념을 복습하고 지문 이해력과 표현력을 점검합니다.' },
  english: { label: '영어', src: 'english_hub.html', fallback: '영어 어휘, 문법, 독해 핵심 개념을 복습하고 문장 해석과 내용 이해를 점검합니다.' },
  science: { label: '통합과학', src: 'science_hub.html', fallback: '통합과학의 물질, 에너지, 생명, 지구 시스템 핵심 개념을 복습하고 원리 적용을 점검합니다.' },
  society: { label: '통합사회', src: 'society_hub.html', fallback: '통합사회에서 다루는 인간, 사회, 공간, 윤리 핵심 개념을 복습하고 사례 적용을 점검합니다.' },
  info: { label: '정보', src: 'mega_study.html', fallback: '정보 과목의 알고리즘, 프로그래밍, 자료 표현, 디지털 윤리 핵심 개념을 복습하고 문제 해결력을 점검합니다.' }
};

function updateProfileHeader() {
  const nameEl = document.getElementById('profileNameLabel');
  const classEl = document.getElementById('profileClassLabel');
  const avatarEl = document.getElementById('profileAvatar');
  const fallbackEl = document.getElementById('profileAvatarFallback');
  const name = localStorage.getItem(PROFILE_NAME_KEY) || '이름 미설정';
  const classNo = localStorage.getItem(PROFILE_CLASS_KEY);
  const numberNo = localStorage.getItem(PROFILE_NUMBER_KEY);
  const photoData = localStorage.getItem(PROFILE_PHOTO_KEY);
  if (nameEl) nameEl.textContent = name;
  if (classEl) classEl.textContent = classNo && numberNo ? `${classNo}반 ${numberNo}번` : '반/번호 미설정';
  if (avatarEl && fallbackEl) {
    if (photoData) {
      avatarEl.src = photoData;
      avatarEl.style.display = 'block';
      fallbackEl.style.display = 'none';
    } else {
      avatarEl.style.display = 'none';
      fallbackEl.style.display = 'grid';
    }
  }
}

function initProfileModal() {
  const modal = document.getElementById('profileModal');
  const classInput = document.getElementById('profileClassInput');
  const numberInput = document.getElementById('profileNumberInput');
  const nameInput = document.getElementById('profileNameInput');
  const photoInput = document.getElementById('profilePhotoInput');
  const saveBtn = document.getElementById('profileSaveBtn');
  const editBtn = document.getElementById('profileEditBtn');
  const msgEl = document.getElementById('profileModalMsg');
  if (!modal || !classInput || !numberInput || !nameInput || !photoInput || !saveBtn || !editBtn || !msgEl) return;

  classInput.value = localStorage.getItem(PROFILE_CLASS_KEY) || '';
  numberInput.value = localStorage.getItem(PROFILE_NUMBER_KEY) || '';
  nameInput.value = localStorage.getItem(PROFILE_NAME_KEY) || '';
  let pendingPhoto = localStorage.getItem(PROFILE_PHOTO_KEY) || '';

  photoInput.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pendingPhoto = typeof reader.result === 'string' ? reader.result : '';
      msgEl.textContent = '사진이 선택되었습니다.';
    };
    reader.readAsDataURL(file);
  });

  saveBtn.addEventListener('click', () => {
    const classNo = Number(classInput.value || 0);
    const numberNo = Number(numberInput.value || 0);
    const name = nameInput.value.trim();
    if (!Number.isInteger(classNo) || classNo < 1 || classNo > 8) { msgEl.textContent = '반은 1~8로 입력하세요.'; return; }
    if (!Number.isInteger(numberNo) || numberNo < 1 || numberNo > 35) { msgEl.textContent = '번호는 1~35로 입력하세요.'; return; }
    if (!name) { msgEl.textContent = '이름을 입력하세요.'; return; }
    localStorage.setItem(PROFILE_CLASS_KEY, String(classNo));
    localStorage.setItem(PROFILE_NUMBER_KEY, String(numberNo));
    localStorage.setItem(PROFILE_NAME_KEY, name);
    if (pendingPhoto) localStorage.setItem(PROFILE_PHOTO_KEY, pendingPhoto);
    updateProfileHeader();
    modal.classList.remove('show');
  });

  editBtn.addEventListener('click', () => { msgEl.textContent = ''; modal.classList.add('show'); });
  updateProfileHeader();
}

function setActive(btn) {
  document.querySelectorAll('.menu button').forEach((b) => b.classList.remove('active'));
  versionToggleBtn?.classList.remove('active');
  btn?.classList.add('active');
}
function getSubjectToggleText(collapsed) {
  if (isMobileLiteMode()) return collapsed ? '과목 열기' : '과목 닫기';
  return collapsed ? '과목' : '닫기';
}
function applySidebarState(collapsed) {
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  if (subjectToggleBtn) {
    subjectToggleBtn.setAttribute('aria-expanded', String(!collapsed));
    subjectToggleBtn.setAttribute('aria-label', collapsed ? '과목 선택 영역 열기' : '과목 선택 영역 닫기');
    subjectToggleBtn.textContent = getSubjectToggleText(collapsed);
  }
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
}
function initSubjectSidebarToggle() {
  const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  applySidebarState(saved);
  subjectToggleBtn?.addEventListener('click', () => {
    applySidebarState(!document.body.classList.contains('sidebar-collapsed'));
  });
  sidebarCloseBtn?.addEventListener('click', () => {
    showVersionHistory(versionToggleBtn);
  });
}
function showDashboard(btn) {
  setActive(btn);
  document.body.classList.remove('subject-mode');
  dashPanel.classList.add('active');
  framePanel.classList.remove('active');
  if (versionPanel) versionPanel.classList.remove('active');
  if (aiCoachPanel) aiCoachPanel.classList.remove('active');
  title.textContent = '기말 학습 대시보드';
  desc.textContent = '';
  if (window.syncInkContext) window.syncInkContext();
}
function showSubject(btn, heading) {
  setActive(btn);
  document.body.classList.add('subject-mode');
  dashPanel.classList.remove('active');
  if (versionPanel) versionPanel.classList.remove('active');
  if (aiCoachPanel) aiCoachPanel.classList.remove('active');
  framePanel.classList.add('active');
  frame.dataset.subject = btn.dataset.subject || inferSubjectFromSrc(btn.dataset.src || '');
  frame.src = btn.dataset.src;
  title.textContent = heading;
  desc.textContent = '';
  const autoStatusEl = document.getElementById('aiAutoStatus');
  if (autoStatusEl) autoStatusEl.textContent = `${heading} 로딩 중...`;
  frame.onload = () => {
    autoAnalyzeCurrentFrame(heading);
    bindFrameInkContextSync();
    resizeSubjectFrameForMobile();
    if (window.syncInkContext) window.syncInkContext();
  };
  resizeSubjectFrameForMobile();
  if (window.syncInkContext) window.syncInkContext();
}


function showAiCoachPanel(btn) {
  setActive(btn);
  document.body.classList.remove('subject-mode');
  dashPanel.classList.remove('active');
  framePanel.classList.remove('active');
  if (versionPanel) versionPanel.classList.remove('active');
  if (aiCoachPanel) aiCoachPanel.classList.add('active');
  title.textContent = '스마트 AI 학습 코치';
  desc.textContent = '학습 내용을 분석해 문제와 계획을 만드는 AI 코치';
  if (window.syncInkContext) window.syncInkContext();
}

function showVersionHistory(btn) {
  setActive(btn || versionToggleBtn);
  document.body.classList.remove('subject-mode');
  dashPanel.classList.remove('active');
  framePanel.classList.remove('active');
  if (versionPanel) versionPanel.classList.add('active');
  if (aiCoachPanel) aiCoachPanel.classList.remove('active');
  title.textContent = '업데이트 내역';
  desc.textContent = '학습 포털 변경 사항';
  if (window.syncInkContext) window.syncInkContext();
}



function initMobileHomeClose() {
  const homeLink = document.querySelector('.home a');
  if (!homeLink || !subjectToggleBtn) return;
  homeLink.textContent = '닫기';
  homeLink.setAttribute('aria-label', '모바일 과목 선택 영역 닫기');
  homeLink.addEventListener('click', (event) => {
    if (!isMobileLiteMode()) return;
    event.preventDefault();
    applySidebarState(true);
  });
}



function initMobileSubjectBarExpansion() {
  const menu = document.querySelector('.menu');
  if (!menu) return;
  menu.querySelectorAll('.subject-menu-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });
}

function initMobileLitePortal() {
  document.body.classList.add('mobile-lite');
  applySidebarState(false);
  document.querySelector('.mobile-logo-text')?.removeAttribute('hidden');
  initMobileHomeClose();
  initMobileSubjectBarExpansion();
  const firstSubjectBtn = document.querySelector('.menu button[data-src]');
  if (!firstSubjectBtn) return;
  const label = firstSubjectBtn.textContent.replace(/^[^가-힣A-Za-z0-9]+/, '').trim() || '학습 내용';
  showSubject(firstSubjectBtn, label);
}

function inferSubjectFromSrc(src) {
  const clean = String(src || '').split('/').pop().replace(/\.html(?:[#?].*)?$/, '');
  if (clean.includes('korean')) return 'korean';
  if (clean.includes('english')) return 'english';
  if (clean.includes('science')) return 'science';
  if (clean.includes('society')) return 'society';
  if (clean.includes('mega') || clean.includes('info')) return 'info';
  return clean || 'subject';
}

function getNestedFrameDocument(rootFrame) {
  try {
    const doc = rootFrame?.contentDocument;
    if (!doc) return null;
    const activeTab = doc.querySelector('.tab-btn.active');
    if (activeTab) return doc;
    const inner = doc.querySelector('iframe');
    return inner?.contentDocument || doc;
  } catch (_) {
    return null;
  }
}

function getCurrentInkScope() {
  if (!document.body.classList.contains('subject-mode')) return 'dashboard';
  const subject = frame?.dataset.subject || inferSubjectFromSrc(frame?.getAttribute('src') || '');
  const doc = getNestedFrameDocument(frame);
  const activeTab = doc?.querySelector('.tab-btn.active');
  const activePanel = doc?.querySelector('.tab-panel.active');
  const tab = activeTab?.dataset?.tab || activePanel?.id || 'page';
  return `subject:${subject}:tab:${tab}`;
}

function resizeSubjectFrameForMobile() {
  if (!isMobileLiteMode() || !frame || !document.body.classList.contains('subject-mode')) {
    if (frame) frame.style.height = '';
    return;
  }
  window.requestAnimationFrame(() => {
    const doc = getNestedFrameDocument(frame);
    const docEl = doc?.documentElement;
    const body = doc?.body;
    const contentHeight = Math.max(docEl?.scrollHeight || 0, body?.scrollHeight || 0, docEl?.offsetHeight || 0, body?.offsetHeight || 0);
    const minHeight = Math.max(520, window.innerHeight - 150);
    frame.style.height = `${Math.max(contentHeight + 24, minHeight)}px`;
  });
}

function bindFrameInkContextSync() {
  const doc = getNestedFrameDocument(frame);
  if (!doc || doc.body?.dataset.inkSyncBound === '1') return;
  if (doc.body) doc.body.dataset.inkSyncBound = '1';
  doc.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        resizeSubjectFrameForMobile();
        if (window.syncInkContext) window.syncInkContext();
      }, 30);
    });
  });
  const nested = frame?.contentDocument?.querySelector('iframe');
  if (nested && nested.dataset.inkSyncBound !== '1') {
    nested.dataset.inkSyncBound = '1';
    nested.addEventListener('load', () => {
      bindFrameInkContextSync();
      resizeSubjectFrameForMobile();
      if (window.syncInkContext) window.syncInkContext();
    });
  }
}

function autoAnalyzeCurrentFrame(heading) {
  const autoStatusEl = document.getElementById('aiAutoStatus');
  const raw = extractTextFromCurrentFrame();
  if (!raw || raw.length < 30) {
    if (autoStatusEl) autoStatusEl.textContent = '페이지에서 텍스트를 찾지 못했습니다.';
    return;
  }
  if (autoStatusEl) autoStatusEl.textContent = `${heading} 분석 중...`;
  if (aiMsgEl) aiMsgEl.textContent = '분석 중...';
  runAiLearning(raw).then(() => {
    if (autoStatusEl) {
      autoStatusEl.textContent = `✅ ${heading} 분석 완료!`;
      setTimeout(() => { if (autoStatusEl.textContent.includes('완료')) autoStatusEl.textContent = ''; }, 3000);
    }
  });
}
function renderDday() { if (!ddayEl) return; const t = new Date(); const e = new Date(`${FINAL_EXAM_DATE}T00:00:00`); const ms = e - new Date(t.getFullYear(), t.getMonth(), t.getDate()); const d = Math.ceil(ms / 86400000); ddayEl.textContent = d > 0 ? `D-${d}` : d === 0 ? 'D-DAY' : `D+${Math.abs(d)}`; }
function loadGoal() { const saved = localStorage.getItem(GOAL_STORAGE_KEY); if (saved && saved.trim()) { goalValueEl.textContent = saved; goalInput.value = saved; } }
function saveGoal() { const v = goalInput.value.trim(); if (!v) { goalMsgEl.textContent = '목표를 입력해 주세요.'; return; } localStorage.setItem(GOAL_STORAGE_KEY, v); goalValueEl.textContent = v; goalMsgEl.textContent = '개인 목표가 저장되었습니다.'; setTimeout(() => { if (goalMsgEl.textContent === '개인 목표가 저장되었습니다.') goalMsgEl.textContent = ''; }, 1800); }
function loadMemo() {
  const saved = localStorage.getItem(MEMO_STORAGE_KEY);
  if (!memoInput) return;
  memoInput.value = saved || '';
}
function saveMemo() {
  if (!memoInput) return;
  try {
    const v = memoInput.value || '';
    localStorage.setItem(MEMO_STORAGE_KEY, v);
    if (memoMsgEl) {
      memoMsgEl.textContent = '오늘 메모가 저장되었습니다.';
      setTimeout(() => { if (memoMsgEl.textContent === '오늘 메모가 저장되었습니다.') memoMsgEl.textContent = ''; }, 1800);
    }
  } catch (_) {
    if (memoMsgEl) memoMsgEl.textContent = '메모 저장에 실패했습니다.';
  }
}



function initGlobalInk() {
  const canvas = document.getElementById('inkLayer');
  const toolbar = document.getElementById('inkToolbar');
  const toggleBtn = document.getElementById('inkToggleBtn');
  const penBtn = document.getElementById('inkPenBtn');
  const eraserBtn = document.getElementById('inkEraserBtn');
  const highlighterBtn = document.getElementById('inkHighlighterBtn');
  const undoBtn = document.getElementById('inkUndoBtn');
  const redoBtn = document.getElementById('inkRedoBtn');
  const clearBtn = document.getElementById('inkClearBtn');
  const saveBtn = document.getElementById('inkSaveBtn');
  const sizeInput = document.getElementById('inkSizeRange');
  const colorInput = document.getElementById('inkColorInput');
  const msg = document.getElementById('inkMsg');
  if (!canvas || !toolbar || !toggleBtn || !penBtn || !eraserBtn || !highlighterBtn || !undoBtn || !redoBtn || !clearBtn || !saveBtn || !sizeInput || !colorInput || !msg) return;

  const INK_STROKES_PREFIX = 'studymax_ink_strokes_v2:';
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let drawing = false;
  let mode = 'pen';
  let penSize = Number(sizeInput.value || 3);
  let penColor = colorInput.value || '#0f172a';
  let currentStroke = null;
  let strokes = [];
  let redoStack = [];
  localStorage.removeItem('studymax_ink_toolbar_position_v1');

  let activeInkScope = getCurrentInkScope();
  toolbar.dataset.inkScope = activeInkScope;

  function setMsg(text) { msg.textContent = text; if (!text) return; setTimeout(() => { if (msg.textContent === text) msg.textContent = ''; }, 1800); }
  function setTool(next) {
    mode = next;
    penBtn.classList.toggle('active', next === 'pen');
    eraserBtn.classList.toggle('active', next === 'eraser');
    highlighterBtn.classList.toggle('active', next === 'highlighter');
  }
  function updateUndoRedoUI() {
    undoBtn.disabled = strokes.length === 0;
    redoBtn.disabled = redoStack.length === 0;
  }
  function toDocumentXY(e) {
    return { x: e.clientX + window.scrollX, y: e.clientY + window.scrollY };
  }
  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const doc = document.documentElement;
    const w = Math.max(doc.scrollWidth, window.innerWidth);
    const h = Math.max(doc.scrollHeight, window.innerHeight);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawAll();
  }
  function applyStrokeStyle(stroke) {
    if (stroke.mode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.lineWidth = Math.max(10, stroke.size * 3);
    } else if (stroke.mode === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = Math.max(8, stroke.size * 2.2);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
  function drawStroke(stroke) {
    if (!stroke.points || stroke.points.length < 2) return;
    applyStrokeStyle(stroke);
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    ctx.stroke();
    ctx.closePath();
  }
  function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of strokes) drawStroke(s);
  }
  function inkStorageKey(scope = activeInkScope) {
    return `${INK_STROKES_PREFIX}${scope}`;
  }
  function persistStrokes() {
    localStorage.setItem(inkStorageKey(), JSON.stringify(strokes));
  }
  function loadStrokes() {
    try {
      const raw = localStorage.getItem(inkStorageKey());
      strokes = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(strokes)) strokes = [];
    } catch (_) { strokes = []; }
  }
  function syncInkContext() {
    const nextScope = getCurrentInkScope();
    if (nextScope === activeInkScope) return;
    persistStrokes();
    activeInkScope = nextScope;
    toolbar.dataset.inkScope = activeInkScope;
    redoStack = [];
    loadStrokes();
    drawAll();
    updateUndoRedoUI();
    setMsg(activeInkScope === 'dashboard' ? '대시보드 필기 불러옴' : '현재 탭 필기 불러옴');
  }
  window.syncInkContext = syncInkContext;
  function beginStroke(e) {
    if (!document.body.classList.contains('ink-on')) return;
    if (e.target.closest && e.target.closest('#inkToolbar')) return;
    drawing = true;
    currentStroke = { mode, size: penSize, color: penColor, points: [] };
    currentStroke.points.push(toDocumentXY(e));
    e.preventDefault();
  }
  function moveStroke(e) {
    if (!drawing || !currentStroke) return;
    currentStroke.points.push(toDocumentXY(e));
    drawAll();
    drawStroke(currentStroke);
    e.preventDefault();
  }
  function endStroke() {
    if (!drawing || !currentStroke) return;
    drawing = false;
    if (currentStroke.points.length > 1) {
      strokes.push(currentStroke);
      if (strokes.length > 400) strokes = strokes.slice(strokes.length - 400);
      redoStack = [];
            persistStrokes();
      updateUndoRedoUI();
    }
    currentStroke = null;
  }
  function clearInk() {
    strokes = [];
    redoStack = [];
    drawAll();
    persistStrokes();
    updateUndoRedoUI();
  }
  function saveInk() { persistStrokes(); setMsg('손글씨 저장 완료'); }
  function undoInk() {
    if (!strokes.length) return;
    redoStack.push(strokes.pop());
    if (redoStack.length > 10) redoStack = redoStack.slice(redoStack.length - 10);
    drawAll(); persistStrokes(); updateUndoRedoUI();
  }
  function redoInk() {
    if (!redoStack.length) return;
    strokes.push(redoStack.pop());
    drawAll(); persistStrokes(); updateUndoRedoUI();
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('ink-on');
    const on = document.body.classList.contains('ink-on');
    toggleBtn.classList.toggle('active', on);
    toggleBtn.textContent = on ? '✍️ 손글씨 모드 ON' : '✍️ 손글씨 모드';
    setMsg(on ? '손글씨 모드 시작' : '손글씨 모드 종료');
  });
  penBtn.addEventListener('click', () => setTool('pen'));
  eraserBtn.addEventListener('click', () => setTool('eraser'));
  highlighterBtn.addEventListener('click', () => setTool('highlighter'));
  undoBtn.addEventListener('click', undoInk);
  redoBtn.addEventListener('click', redoInk);
  sizeInput.addEventListener('input', () => { penSize = Number(sizeInput.value); });
  colorInput.addEventListener('input', () => { penColor = colorInput.value; });
  clearBtn.addEventListener('click', () => { clearInk(); setMsg('전체 지움'); });
  saveBtn.addEventListener('click', saveInk);
  canvas.addEventListener('pointerdown', beginStroke, { passive: false });
  canvas.addEventListener('pointermove', moveStroke, { passive: false });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => canvas.addEventListener(evt, endStroke));

  loadStrokes();
  resizeCanvas();
  updateUndoRedoUI();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('beforeunload', persistStrokes);
}


const mobileLiteMode = isMobileLiteMode();

renderDday();
loadGoal();
loadMemo();

function initCorePortalFeatures() {
  initSubjectSidebarToggle();
  if (goalSaveBtn) goalSaveBtn.addEventListener('click', saveGoal);
  if (goalInput) goalInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveGoal(); });
  if (memoSaveBtn) memoSaveBtn.addEventListener('click', saveMemo);
  if (memoInput) memoInput.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveMemo(); });
  initProfileModal();
  initGlobalInk();
}

initCorePortalFeatures();

if (mobileLiteMode) {
  initMobileLitePortal();
}


initAiCoach();



function extractTextFromCurrentFrame() {
  const doc = getNestedFrameDocument(frame);
  if (!doc) return '';
  const bodyText = doc.body ? (doc.body.textContent || doc.body.innerText || '') : '';
  return (bodyText || '').replace(/\s+/g, ' ').trim();
}

function getAiApiUrl() {
  const configured = String(window.SIMPUL_AI_API_URL || '').trim();
  return configured || `${window.location.origin}/api/ai/analyze`;
}

function getBrowserOpenAiKey() {
  return String(window.SIMPUL_OPENAI_API_KEY || '').trim();
}

function getOpenAiModel() {
  return String(window.SIMPUL_OPENAI_MODEL || 'gpt-4.1-mini').trim() || 'gpt-4.1-mini';
}

function getAiJsonSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      summary_points: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
      questions: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 5 }
    },
    required: ['summary_points', 'questions']
  };
}

function parseOpenAiJsonResponse(data) {
  const outputText = data?.output_text
    || data?.output?.flatMap((item) => item?.content || []).map((part) => part?.text || '').join('')
    || '';
  const cleaned = outputText.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  const parsed = JSON.parse(cleaned);
  return {
    summary_points: (Array.isArray(parsed.summary_points) ? parsed.summary_points : []).map(String).filter(Boolean).slice(0, 3),
    questions: (Array.isArray(parsed.questions) ? parsed.questions : []).map(String).filter(Boolean).slice(0, 5)
  };
}

async function requestAiDirectlyFromOpenAi(raw, subject) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getBrowserOpenAiKey()}`
    },
    body: JSON.stringify({
      model: getOpenAiModel(),
      instructions: [
        '너는 한국어로 답하는 중고등학생용 학습 코치다.',
        '입력된 학습 내용을 바탕으로 개념을 익히게 하는 연습문제를 만든다.',
        '각 문제는 짧은 개념 설명, 적용 문제, 풀이 방향을 함께 담아 학습용으로 만든다.',
        '과목명이 있으면 해당 과목 시험 대비에 맞는 연습문제로 만든다.',
        '반드시 JSON만 출력한다. 형식: {"summary_points":["..."],"questions":["..."]}'
      ].join(' '),
      input: `과목: ${subject || '선택 과목'}\n학습 내용:\n${raw.slice(0, 12000)}\n\n요구사항:\n- summary_points는 3개 이하\n- questions는 5개\n- 각 questions 항목은 '개념 설명 → 연습문제 → 풀이 방향' 순서로 구성\n- 한국어로 작성`,
      text: {
        format: {
          type: 'json_schema',
          name: 'study_coach_result',
          strict: true,
          schema: getAiJsonSchema()
        }
      }
    })
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}`);
  const parsed = parseOpenAiJsonResponse(await response.json());
  if (!parsed.summary_points.length || !parsed.questions.length) throw new Error('OpenAI 응답 형식 오류');
  return parsed;
}

async function requestAiFromApi(raw, subjectKey = '') {
  const subject = AI_SUBJECTS[subjectKey]?.label || subjectKey || '';
  if (getBrowserOpenAiKey()) return requestAiDirectlyFromOpenAi(raw, subject);

  const apiUrl = getAiApiUrl();
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: raw, subject, lang: 'ko', mode: 'study_coach' })
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}

function getSelectedAiSubject() {
  const key = aiSubjectSelect?.value || frame?.dataset?.subject || 'korean';
  return AI_SUBJECTS[key] ? key : 'korean';
}

function htmlToPlainText(html) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  doc.querySelectorAll('script, style, noscript, canvas').forEach((el) => el.remove());
  return (doc.body?.textContent || doc.body?.innerText || '').replace(/\s+/g, ' ').trim();
}

async function fetchHtmlTextWithIframes(src, depth = 0) {
  if (!src || depth > 3) return '';
  const cacheKey = `${depth}:${new URL(src, window.location.href).href}`;
  if (subjectTextCache.has(cacheKey)) return subjectTextCache.get(cacheKey);
  const response = await fetch(src);
  if (!response.ok) return '';
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const frameTexts = await Promise.all(Array.from(doc.querySelectorAll('iframe[src]')).map((iframe) => {
    const childSrc = new URL(iframe.getAttribute('src'), response.url || window.location.href).href;
    return fetchHtmlTextWithIframes(childSrc, depth + 1);
  }));
  doc.querySelectorAll('iframe').forEach((iframe) => iframe.remove());
  const text = [htmlToPlainText(doc.documentElement.outerHTML), ...frameTexts].filter(Boolean).join(' ');
  subjectTextCache.set(cacheKey, text);
  return text;
}

async function loadSubjectText(subjectKey) {
  const subject = AI_SUBJECTS[subjectKey] || AI_SUBJECTS.korean;
  if (frame?.dataset?.subject === subjectKey) {
    const currentText = extractTextFromCurrentFrame();
    if (currentText && currentText.length > 80) return currentText;
  }
  try {
    const text = await fetchHtmlTextWithIframes(subject.src);
    if (text) return text;
  } catch (_) {}
  return subject.fallback;
}

function buildSubjectPrompt(subjectKey, bodyText, previousQuestions = []) {
  const subject = AI_SUBJECTS[subjectKey] || AI_SUBJECTS.korean;
  const history = previousQuestions.length
    ? `\n\n이미 나온 문제(절대 반복 금지):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';
  return `[과목: ${subject.label}]\n다음 iframe 과목 파일에서 실제로 추출한 학습 개념을 빠짐없이 훑으면서 시험 대비 연습문제를 만들어 주세요.\n이번에는 아직 다루지 않은 개념을 우선 사용하고, 버튼을 다시 누를 때마다 이어서 새 연습문제를 만들 수 있게 서로 다르게 만드세요. 각 문제는 학생이 개념을 배우도록 '개념 설명 → 연습문제 → 풀이 방향'을 한 카드에 함께 담으세요.${history}\n\niframe에서 추출한 실제 학습 내용:\n${bodyText}`;
}

function getSavedAiQuestions() {
  try {
    const questions = JSON.parse(localStorage.getItem(AI_QUESTIONS_KEY) || '[]');
    return Array.isArray(questions) ? questions.map(String).filter(Boolean) : [];
  } catch (_) {
    return [];
  }
}

function persistAiResult(summaryPoints, questions, sourceLength, subjectKey = '', options = {}) {
  const bank = JSON.parse(localStorage.getItem(AI_CONTENT_BANK_KEY) || '[]');
  const subject = AI_SUBJECTS[subjectKey]?.label || subjectKey || '직접 입력';
  const nextQuestions = options.append ? [...getSavedAiQuestions(), ...questions] : questions;
  bank.push({ date: new Date().toISOString().slice(0, 10), length: sourceLength, subject, points: summaryPoints, totalQuestions: nextQuestions.length });
  localStorage.setItem(AI_CONTENT_BANK_KEY, JSON.stringify(bank.slice(-200)));
  localStorage.setItem(AI_QUESTIONS_KEY, JSON.stringify(nextQuestions));
  if (!options.append) setActiveAiQuestionIndex(0);
}


function saveActiveAiSource(subjectKey, sourceText) {
  localStorage.setItem(AI_ACTIVE_SUBJECT_KEY, subjectKey);
  localStorage.setItem(AI_ACTIVE_SOURCE_KEY, sourceText.slice(0, 12000));
}

function getActiveAiSource() {
  const subjectKey = localStorage.getItem(AI_ACTIVE_SUBJECT_KEY) || getSelectedAiSubject();
  const sourceText = localStorage.getItem(AI_ACTIVE_SOURCE_KEY) || '';
  return { subjectKey: AI_SUBJECTS[subjectKey] ? subjectKey : getSelectedAiSubject(), sourceText };
}

async function runAiLearning(raw, subjectKey = getSelectedAiSubject(), options = {}) {
  try {
    const apiResult = await requestAiFromApi(raw, subjectKey);
    if (apiResult && Array.isArray(apiResult.questions)) {
      const points = Array.isArray(apiResult.summary_points) ? apiResult.summary_points.slice(0, 3) : [];
      persistAiResult(points, apiResult.questions, raw.length, subjectKey, options);
      const subjectLabel = AI_SUBJECTS[subjectKey]?.label || '직접 입력';
      aiMsgEl.textContent = `${subjectLabel} API 문제 생성 완료: 새 문제 ${apiResult.questions.length}개 · 누적 ${getSavedAiQuestions().length}개`;
      renderAiCoach();
      renderAiQuizCards();
      return;
    }
  } catch (e) {
    aiMsgEl.textContent = `API 호출 실패 (${e.message}). 로컬 모드로 전환합니다.`;
  }

  const summary = summarizeForAi(raw);
  const questions = buildQuestionsFromText(raw);
  persistAiResult(summary.points, questions, summary.totalLength, subjectKey, options);
  const subjectLabel = AI_SUBJECTS[subjectKey]?.label || '직접 입력';
  aiMsgEl.textContent = `${subjectLabel} 로컬 문제 생성 완료: 새 문제 ${questions.length}개 · 누적 ${getSavedAiQuestions().length}개`;
  renderAiCoach();
  renderAiQuizCards();
}

function summarizeForAi(raw) {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  const pieces = cleaned.split(/[.!?]/).map((s) => s.trim()).filter(Boolean);
  const points = pieces.slice(0, 3);
  return {
    totalLength: cleaned.length,
    points
  };
}

function buildQuestionsFromText(raw) {
  const words = raw
    .replace(/[^0-9a-zA-Z가-힣\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2);
  const uniq = [];
  for (const w of words) { if (!uniq.includes(w)) uniq.push(w); if (uniq.length >= 6) break; }
  if (!uniq.length) return [];
  const q = [];
  q.push(`핵심 키워드 3개를 고르고 각 키워드의 의미를 설명해 보세요. (후보: ${uniq.slice(0, 6).join(', ')})`);
  q.push(`위 내용의 흐름을 3단계(시작-핵심-정리)로 요약해 보세요.`);
  q.push(`오늘 학습 후 바로 복습이 필요한 부분 1개를 고르고 이유를 쓰세요.`);
  if (uniq[0]) q.push(`"${uniq[0]}"를 처음 배우는 친구에게 2문장으로 설명해 보세요.`);
  return q;
}

function renderAiCoach() {
  if (!aiSummaryEl || !aiQuestionListEl) return;
  const savedQ = JSON.parse(localStorage.getItem(AI_QUESTIONS_KEY) || '[]');
  aiQuestionListEl.innerHTML = '';
  if (Array.isArray(savedQ)) savedQ.forEach((x) => { const li = document.createElement('li'); li.textContent = x; aiQuestionListEl.appendChild(li); });
  const bank = JSON.parse(localStorage.getItem(AI_CONTENT_BANK_KEY) || '[]');
  if (Array.isArray(bank) && bank.length) {
    const last = bank[bank.length - 1];
    aiSummaryEl.textContent = `누적 학습 데이터 ${bank.length}건 · 최근 ${last.subject || '직접 입력'} · ${last.date} · 길이 ${last.length}자`;
  } else {
    aiSummaryEl.textContent = '아직 학습 데이터가 없습니다.';
  }
}

function createAiQuizCard(q, idx) {
  const card = document.createElement('article');
  card.className = 'ai-quiz-card';
  const title = document.createElement('h4');
  title.textContent = `연습문제 ${idx + 1}`;
  const body = document.createElement('p');
  body.textContent = String(q);
  card.append(title, body);
  return card;
}

function getActiveAiQuestionIndex(total) {
  const raw = Number(localStorage.getItem(AI_ACTIVE_INDEX_KEY) || 0);
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.min(raw, Math.max(0, total - 1));
}

function setActiveAiQuestionIndex(index) {
  localStorage.setItem(AI_ACTIVE_INDEX_KEY, String(Math.max(0, index)));
}

function renderAiPracticeViewer(questions) {
  if (!aiPracticeCardEl) return;
  aiPracticeCardEl.innerHTML = '';
  const total = questions.length;
  const activeIndex = getActiveAiQuestionIndex(total);
  if (aiPracticeProgressEl) aiPracticeProgressEl.textContent = total ? `${activeIndex + 1} / ${total}` : '0 / 0';
  if (aiPrevQuestionBtn) aiPrevQuestionBtn.disabled = !total || activeIndex <= 0;
  if (aiNextQuestionBtn) aiNextQuestionBtn.disabled = !total || activeIndex >= total - 1;

  if (!total) {
    const empty = document.createElement('p');
    empty.className = 'ai-sub';
    empty.textContent = '과목을 선택하면 연습문제가 한 문제씩 표시됩니다.';
    aiPracticeCardEl.appendChild(empty);
    return;
  }

  aiPracticeCardEl.appendChild(createAiQuizCard(questions[activeIndex], activeIndex));
}

function renderDashboardAiQuizCards(questions) {
  if (!aiQuizCardsEl) return;
  aiQuizCardsEl.innerHTML = '';
  if (!questions.length) {
    const empty = document.createElement('p');
    empty.className = 'ai-sub';
    empty.textContent = '아직 생성된 문제가 없습니다.';
    aiQuizCardsEl.appendChild(empty);
    return;
  }
  questions.slice(0, 3).forEach((q, idx) => aiQuizCardsEl.appendChild(createAiQuizCard(q, idx)));
}

function renderAiQuizCards() {
  const questions = getSavedAiQuestions();
  renderDashboardAiQuizCards(questions);
  renderAiPracticeViewer(questions);
}

function initAiCoach() {
  const widget = document.getElementById('aiWidget');
  const minBtn = document.getElementById('aiMinBtn');
  const dockToggleBtn = document.getElementById('aiDockToggle');
  if (!aiSourceInput || !aiAnalyzeBtn || !aiMsgEl || !aiAnalyzeFrameBtn) return;

  if (widget && minBtn && dockToggleBtn) {
    const restoreWidgetPosition = initAiWidgetDrag(widget);


  function setDockState(minimized) {
      widget.classList.remove('dock-left');
      widget.classList.add('dock-right');
      widget.classList.toggle('minimized', minimized);
      dockToggleBtn.textContent = minimized ? '🤖 AI' : '숨기기';
      dockToggleBtn.title = minimized ? '펼치기' : '숨기기';
      if (minimized) {
        widget.style.left = '';
        widget.style.top = '';
        widget.style.right = '';
        widget.style.bottom = '';
      } else if (typeof restoreWidgetPosition === 'function') {
        restoreWidgetPosition();
      }
    }

    minBtn.addEventListener('click', () => setDockState(true));
    dockToggleBtn.addEventListener('click', () => setDockState(!widget.classList.contains('minimized')));
  }

  renderAiCoach();
  renderAiQuizCards();

  const generateSelectedSubjectQuestions = async () => {
    const subjectKey = getSelectedAiSubject();
    const subject = AI_SUBJECTS[subjectKey] || AI_SUBJECTS.korean;
    aiMsgEl.textContent = `${subject.label} 연결된 iframe 내용을 분석해서 연습문제를 생성하는 중...`;
    const subjectText = await loadSubjectText(subjectKey);
    saveActiveAiSource(subjectKey, subjectText);
    localStorage.setItem(AI_ROUND_KEY, '1');
    await runAiLearning(buildSubjectPrompt(subjectKey, subjectText), subjectKey, { append: false });
  };

  aiSubjectSelect?.addEventListener('change', generateSelectedSubjectQuestions);
  aiGenerateSubjectBtn?.addEventListener('click', generateSelectedSubjectQuestions);

  aiPrevQuestionBtn?.addEventListener('click', () => {
    setActiveAiQuestionIndex(getActiveAiQuestionIndex(getSavedAiQuestions().length) - 1);
    renderAiQuizCards();
  });

  aiNextQuestionBtn?.addEventListener('click', () => {
    setActiveAiQuestionIndex(getActiveAiQuestionIndex(getSavedAiQuestions().length) + 1);
    renderAiQuizCards();
  });

  aiMoreQuestionsBtn?.addEventListener('click', async () => {
    let { subjectKey, sourceText } = getActiveAiSource();
    if (!sourceText) {
      subjectKey = getSelectedAiSubject();
      sourceText = await loadSubjectText(subjectKey);
      saveActiveAiSource(subjectKey, sourceText);
    }
    const subject = AI_SUBJECTS[subjectKey] || AI_SUBJECTS.korean;
    const previousQuestions = getSavedAiQuestions();
    const round = Number(localStorage.getItem(AI_ROUND_KEY) || 1) + 1;
    localStorage.setItem(AI_ROUND_KEY, String(round));
    aiMsgEl.textContent = `${subject.label} ${round}번째 카드 묶음을 생성하는 중...`;
    await runAiLearning(buildSubjectPrompt(subjectKey, sourceText, previousQuestions), subjectKey, { append: true });
    setActiveAiQuestionIndex(previousQuestions.length);
    renderAiQuizCards();
  });

  aiAnalyzeBtn.addEventListener('click', () => {
    const raw = (aiSourceInput.value || '').trim();
    if (!raw) { aiMsgEl.textContent = '학습 내용을 입력해 주세요.'; return; }
    const subjectKey = getSelectedAiSubject();
    saveActiveAiSource(subjectKey, raw);
    localStorage.setItem(AI_ROUND_KEY, '1');
    runAiLearning(buildSubjectPrompt(subjectKey, raw), subjectKey, { append: false });
    aiSourceInput.value = '';
  });

  aiAnalyzeFrameBtn.addEventListener('click', () => {
    const raw = extractTextFromCurrentFrame();
    if (!raw) { aiMsgEl.textContent = '현재 학습 페이지에서 분석할 텍스트를 찾지 못했습니다.'; return; }
    const subjectKey = frame?.dataset?.subject || getSelectedAiSubject();
    if (aiSubjectSelect && AI_SUBJECTS[subjectKey]) aiSubjectSelect.value = subjectKey;
    saveActiveAiSource(subjectKey, raw);
    localStorage.setItem(AI_ROUND_KEY, '1');
    runAiLearning(buildSubjectPrompt(subjectKey, raw), subjectKey, { append: false });
  });
}

function initAiWidgetDrag(widget) {
  const grip = document.getElementById('aiGrip');
  const header = widget.querySelector('.ai-widget-header');
  if (!widget) return null;
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let activeHandle = null;

  const clampWidgetPosition = (left, top) => {
    const margin = 8;
    const maxX = Math.max(margin, window.innerWidth - widget.offsetWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - widget.offsetHeight - margin);
    return {
      left: Math.max(margin, Math.min(left, maxX)),
      top: Math.max(margin, Math.min(top, maxY))
    };
  };

  const savePosition = () => {
    const rect = widget.getBoundingClientRect();
    const pos = clampWidgetPosition(rect.left, rect.top);
    localStorage.setItem(AI_WIDGET_POSITION_KEY, JSON.stringify(pos));
  };

  const applyPosition = (pos) => {
    if (!pos || !Number.isFinite(pos.left) || !Number.isFinite(pos.top)) return false;
    const safe = clampWidgetPosition(pos.left, pos.top);
    widget.style.left = `${safe.left}px`;
    widget.style.top = `${safe.top}px`;
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
    widget.classList.remove('dock-left', 'dock-right');
    return true;
  };

  const restorePosition = () => {
    try { return applyPosition(JSON.parse(localStorage.getItem(AI_WIDGET_POSITION_KEY) || 'null')); }
    catch (_) { return false; }
  };

  const move = (e) => {
    if (!dragging) return;
    const pos = clampWidgetPosition(e.clientX - offsetX, e.clientY - offsetY);
    widget.style.left = `${pos.left}px`;
    widget.style.top = `${pos.top}px`;
    e.preventDefault();
  };

  const end = (e) => {
    if (!dragging) return;
    dragging = false;
    widget.classList.remove('dragging');
    savePosition();
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
    try { activeHandle?.releasePointerCapture(e.pointerId); } catch (_) {}
    activeHandle = null;
  };

  const start = (e) => {
    if (widget.classList.contains('minimized')) return;
    if (e.target.closest('button, input, textarea, select, a')) return;
    dragging = true;
    activeHandle = e.currentTarget;
    widget.classList.add('dragging');
    const rect = widget.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    applyPosition({ left: rect.left, top: rect.top });
    try { activeHandle.setPointerCapture(e.pointerId); } catch (_) {}
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    e.preventDefault();
  };

  [grip, header].filter(Boolean).forEach((handle) => {
    handle.addEventListener('pointerdown', start, { passive: false });
  });

  window.addEventListener('resize', () => {
    if (widget.classList.contains('minimized')) return;
    const rect = widget.getBoundingClientRect();
    applyPosition({ left: rect.left, top: rect.top });
    savePosition();
  });

  return restorePosition;
}


window.showDashboard = showDashboard;
window.showSubject = showSubject;
window.showVersionHistory = showVersionHistory;
window.showAiCoachPanel = showAiCoachPanel;
