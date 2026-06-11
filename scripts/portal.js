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
const operatorsPanel = document.getElementById('operatorsPanel');
const frame = document.getElementById('frame');
const subjectToggleBtn = document.getElementById('subjectToggleBtn');
const ddayEl = document.getElementById('ddayValue');
const goalInput = document.getElementById('goalInput');
const goalSaveBtn = document.getElementById('goalSaveBtn');
const goalValueEl = document.getElementById('goalValue');
const goalMsgEl = document.getElementById('goalMsg');
const memoInput = document.getElementById('memoInput');
const memoSaveBtn = document.getElementById('memoSaveBtn');
const memoMsgEl = document.getElementById('memoMsg');

const FINAL_EXAM_DATE = '2026-06-29';
const GOAL_STORAGE_KEY = 'studymax_personal_goal';
const MEMO_STORAGE_KEY = 'studymax_today_memo';
const PROFILE_NAME_KEY = 'studymax_profile_name';
const PROFILE_CLASS_KEY = 'studymax_profile_class';
const PROFILE_NUMBER_KEY = 'studymax_profile_number';
const PROFILE_PHOTO_KEY = 'studymax_profile_photo';
const SIDEBAR_COLLAPSED_KEY = 'studymax_subject_sidebar_collapsed';
const SUBJECT_TAB_INK_SCOPE_NOTE = 'Dashboard, each subject, and each in-subject tab must keep separate ink storage whenever a subject adds tabbed content.';

function bindResponsiveActivation(button, handler) {
  if (!button || typeof handler !== 'function') return;
  let lastPointerActivation = 0;
  let pointerStart = null;
  const run = (event) => {
    button.classList.add('button-interacting');
    window.setTimeout(() => button.classList.remove('button-interacting'), 180);
    handler(event);
  };
  button.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  button.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'mouse' || !pointerStart || pointerStart.id !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
    pointerStart = null;
    if (moved > 10) return;
    lastPointerActivation = Date.now();
    run(event);
  });
  button.addEventListener('pointercancel', () => { pointerStart = null; });
  button.addEventListener('click', (event) => {
    if (Date.now() - lastPointerActivation < 500) return;
    run(event);
  });
}

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

  bindResponsiveActivation(saveBtn, () => {
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
    applySidebarState(true);
  });
}
function showDashboard(btn) {
  setActive(btn);
  document.body.classList.remove('subject-mode');
  dashPanel.classList.add('active');
  framePanel.classList.remove('active');
  if (versionPanel) versionPanel.classList.remove('active');
  if (operatorsPanel) operatorsPanel.classList.remove('active');
  title.textContent = '기말 학습 대시보드';
  desc.textContent = '';
  if (window.syncInkContext) window.syncInkContext();
}
function showSubject(btn, heading) {
  window.SimpulUsage?.track('subject_open', { subject: btn.dataset.usageSubject || btn.dataset.subject || '' });
  setActive(btn);
  document.body.classList.add('subject-mode');
  dashPanel.classList.remove('active');
  if (versionPanel) versionPanel.classList.remove('active');
  if (operatorsPanel) operatorsPanel.classList.remove('active');
  framePanel.classList.add('active');
  frame.dataset.subject = btn.dataset.subject || inferSubjectFromSrc(btn.dataset.src || '');
  frame.src = btn.dataset.src;
  title.textContent = heading;
  desc.textContent = '';
  frame.onload = () => {
    bindFrameInkContextSync();
    resizeSubjectFrameForMobile();
    if (window.syncInkContext) window.syncInkContext();
  };
  resizeSubjectFrameForMobile();
  if (window.syncInkContext) window.syncInkContext();
}

function showOperators(btn) {
  setActive(btn);
  document.body.classList.remove('subject-mode');
  dashPanel.classList.remove('active');
  framePanel.classList.remove('active');
  if (versionPanel) versionPanel.classList.remove('active');
  if (operatorsPanel) operatorsPanel.classList.add('active');
  title.textContent = '운영진';
  desc.textContent = '';
  if (window.syncInkContext) window.syncInkContext();
}

function showVersionHistory(btn) {
  setActive(btn);
  document.body.classList.remove('subject-mode');
  dashPanel.classList.remove('active');
  framePanel.classList.remove('active');
  if (versionPanel) versionPanel.classList.add('active');
  if (operatorsPanel) operatorsPanel.classList.remove('active');
  title.textContent = '업데이트 내역';
  desc.textContent = '학습 포털 변경 사항';
  if (window.syncInkContext) window.syncInkContext();
}

function initMobileHomeClose() {
  const closeBtn = document.getElementById('sidebarCloseBtn');
  if (!closeBtn || !subjectToggleBtn) return;
  closeBtn.setAttribute('aria-label', '과목 선택 영역 닫기');
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
  if (clean.includes('japanese')) return 'japanese';
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

let subjectFrameResizeId = 0;

function resizeSubjectFrameForContent() {
  if (frame && frame.style.height) frame.style.height = '';
  if (window.resizeInkCanvas) window.resizeInkCanvas();
  if (window.redrawInkLayer) window.redrawInkLayer();
}

function scheduleSubjectFrameResize() {
  if (subjectFrameResizeId) return;
  subjectFrameResizeId = window.requestAnimationFrame(() => {
    subjectFrameResizeId = 0;
    resizeSubjectFrameForContent();
  });
}

function resizeSubjectFrameForMobile() {
  scheduleSubjectFrameResize();
}

function bindInkDocumentForContext(doc) {
  if (!doc || doc.body?.dataset.inkSyncBound === '1') return;
  if (doc.body) doc.body.dataset.inkSyncBound = '1';
  doc.defaultView?.addEventListener('scroll', () => {
    if (window.redrawInkLayer) window.redrawInkLayer();
  }, { passive: true });
  doc.defaultView?.visualViewport?.addEventListener('scroll', () => {
    if (window.redrawInkLayer) window.redrawInkLayer();
  }, { passive: true });
  doc.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        resizeSubjectFrameForMobile();
        if (window.syncInkContext) window.syncInkContext();
      }, 30);
    });
  });
}

function bindFrameInkContextSync() {
  const rootDoc = frame?.contentDocument;
  bindInkDocumentForContext(rootDoc);
  const nestedDoc = getNestedFrameDocument(frame);
  if (nestedDoc && nestedDoc !== rootDoc) bindInkDocumentForContext(nestedDoc);
  const nested = rootDoc?.querySelector('iframe');
  if (nested && nested.dataset.inkSyncBound !== '1') {
    nested.dataset.inkSyncBound = '1';
    nested.addEventListener('load', () => {
      bindFrameInkContextSync();
      resizeSubjectFrameForMobile();
      if (window.syncInkContext) window.syncInkContext();
    });
  }
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
  function getSubjectInkMetrics() {
    if (!document.body.classList.contains('subject-mode') || !frame) {
      return { type: 'viewport', originX: 0, originY: 0, scrollX: 0, scrollY: 0, width: window.innerWidth, height: window.innerHeight };
    }
    try {
      const rootRect = frame.getBoundingClientRect();
      const rootDoc = frame.contentDocument;
      const rootWin = frame.contentWindow;
      if (!rootDoc || !rootWin) throw new Error('frame unavailable');
      const hasOwnTabs = Boolean(rootDoc.querySelector('.tab-btn.active'));
      const nested = !hasOwnTabs ? rootDoc.querySelector('iframe') : null;
      const nestedDoc = nested?.contentDocument;
      const nestedWin = nested?.contentWindow;
      if (nestedDoc && nestedWin) {
        const nestedRect = nested.getBoundingClientRect();
        return {
          type: 'subject-content',
          originX: rootRect.left + nestedRect.left,
          originY: rootRect.top + nestedRect.top,
          scrollX: nestedWin.scrollX || nestedDoc.documentElement?.scrollLeft || nestedDoc.body?.scrollLeft || 0,
          scrollY: nestedWin.scrollY || nestedDoc.documentElement?.scrollTop || nestedDoc.body?.scrollTop || 0,
          width: nestedWin.innerWidth || nestedDoc.documentElement?.clientWidth || nestedRect.width,
          height: nestedWin.innerHeight || nestedDoc.documentElement?.clientHeight || nestedRect.height,
        };
      }
      return {
        type: 'subject-content',
        originX: rootRect.left,
        originY: rootRect.top,
        scrollX: rootWin.scrollX || rootDoc.documentElement?.scrollLeft || rootDoc.body?.scrollLeft || 0,
        scrollY: rootWin.scrollY || rootDoc.documentElement?.scrollTop || rootDoc.body?.scrollTop || 0,
        width: rootWin.innerWidth || rootDoc.documentElement?.clientWidth || rootRect.width,
        height: rootWin.innerHeight || rootDoc.documentElement?.clientHeight || rootRect.height,
      };
    } catch (_) {
      return { type: 'viewport', originX: 0, originY: 0, scrollX: 0, scrollY: 0, width: window.innerWidth, height: window.innerHeight };
    }
  }
  function isWithinInkMetrics(e, metrics) {
    if (metrics.type !== 'subject-content') return true;
    return e.clientX >= metrics.originX && e.clientX <= metrics.originX + metrics.width && e.clientY >= metrics.originY && e.clientY <= metrics.originY + metrics.height;
  }
  function toCanvasXY(e, metrics = getSubjectInkMetrics()) {
    if (metrics.type === 'subject-content') {
      return { x: e.clientX - metrics.originX + metrics.scrollX, y: e.clientY - metrics.originY + metrics.scrollY };
    }
    return { x: e.clientX, y: e.clientY };
  }
  function toScreenXY(point, stroke, metrics = getSubjectInkMetrics()) {
    if (stroke.coordSpace === 'subject-content' && metrics.type === 'subject-content') {
      return { x: point.x - metrics.scrollX + metrics.originX, y: point.y - metrics.scrollY + metrics.originY };
    }
    return point;
  }
  function getViewportSize() {
    const doc = document.documentElement;
    return {
      width: Math.max(1, Math.round(window.innerWidth || doc.clientWidth || 1)),
      height: Math.max(1, Math.round(window.innerHeight || doc.clientHeight || 1)),
    };
  }
  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = getViewportSize();
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
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
  function drawStroke(stroke, metrics = getSubjectInkMetrics()) {
    if (!stroke.points || stroke.points.length < 2) return;
    applyStrokeStyle(stroke);
    const firstPoint = toScreenXY(stroke.points[0], stroke, metrics);
    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (let i = 1; i < stroke.points.length; i++) {
      const point = toScreenXY(stroke.points[i], stroke, metrics);
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    ctx.closePath();
  }
  function drawAll() {
    const metrics = getSubjectInkMetrics();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of strokes) drawStroke(s, metrics);
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
  window.resizeInkCanvas = resizeCanvas;
  window.redrawInkLayer = drawAll;
  function beginStroke(e) {
    if (!document.body.classList.contains('ink-on')) return;
    if (e.target.closest && e.target.closest('#inkToolbar')) return;
    const metrics = getSubjectInkMetrics();
    if (!isWithinInkMetrics(e, metrics)) return;
    drawing = true;
    currentStroke = { mode, size: penSize, color: penColor, coordSpace: metrics.type, points: [] };
    currentStroke.points.push(toCanvasXY(e, metrics));
    e.preventDefault();
  }
  function moveStroke(e) {
    if (!drawing || !currentStroke) return;
    const metrics = getSubjectInkMetrics();
    currentStroke.points.push(toCanvasXY(e, metrics));
    drawAll();
    drawStroke(currentStroke, metrics);
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
  bindResponsiveActivation(saveBtn, saveInk);
  canvas.addEventListener('pointerdown', beginStroke, { passive: false });
  canvas.addEventListener('pointermove', moveStroke, { passive: false });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => canvas.addEventListener(evt, endStroke));

  loadStrokes();
  resizeCanvas();
  updateUndoRedoUI();
  window.addEventListener('resize', () => { scheduleSubjectFrameResize(); resizeCanvas(); });
  window.visualViewport?.addEventListener('resize', resizeCanvas);
  window.visualViewport?.addEventListener('scroll', drawAll, { passive: true });
  window.addEventListener('beforeunload', persistStrokes);
}

const mobileLiteMode = isMobileLiteMode();

renderDday();
loadGoal();
loadMemo();

function initCorePortalFeatures() {
  initSubjectSidebarToggle();
  bindResponsiveActivation(goalSaveBtn, saveGoal);
  if (goalInput) goalInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveGoal(); });
  bindResponsiveActivation(memoSaveBtn, saveMemo);
  if (memoInput) memoInput.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveMemo(); });
  initProfileModal();
  initGlobalInk();
}

initCorePortalFeatures();

if (mobileLiteMode) {
  initMobileLitePortal();
}

window.showDashboard = showDashboard;
window.showSubject = showSubject;
window.showOperators = showOperators;
window.showVersionHistory = showVersionHistory;
