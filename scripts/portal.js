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


const ACCESS_CODE_KEY = 'studymax_access_code';
const ACCESS_SERVER_CODE_KEY = 'studymax_access_server_code';
const ACCESS_BIND_MODE_KEY = 'studymax_access_bind_mode';

const MASTER_CODE = 'simpul';
const CLASS_MIN = 1;
const CLASS_MAX = 8;
const NUMBER_MIN = 1;
const NUMBER_MAX = 35;

function isValidClassNumberCode(code) {
  const m = code && code.match(/^(\d+)-(\d{2})$/);
  if (!m) return false;
  const classNo = Number(m[1]);
  const numberNo = Number(m[2]);
  return Number.isInteger(classNo) && Number.isInteger(numberNo) && classNo >= CLASS_MIN && classNo <= CLASS_MAX && numberNo >= NUMBER_MIN && numberNo <= NUMBER_MAX;
}


async function enforceAccessCode() {
  const code = localStorage.getItem(ACCESS_CODE_KEY);
  if (code === MASTER_CODE) return;
  if (!code || !isValidClassNumberCode(code)) {
    window.location.replace('./index.html');
  }
}

enforceAccessCode();

const title = document.getElementById('title');
const desc = document.getElementById('desc');
const dashPanel = document.getElementById('dashPanel');
const framePanel = document.getElementById('framePanel');
const versionPanel = document.getElementById('versionPanel');
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
const aiMsgEl = document.getElementById('aiMsg');
const aiSummaryEl = document.getElementById('aiSummary');
const aiQuestionListEl = document.getElementById('aiQuestionList');
const aiQuizCardsEl = document.getElementById('aiQuizCards');

const FINAL_EXAM_DATE = '2026-06-29';
const GOAL_STORAGE_KEY = 'studymax_personal_goal';
const MEMO_STORAGE_KEY = 'studymax_today_memo';
const PROFILE_NAME_KEY = 'studymax_profile_name';
const PROFILE_CLASS_KEY = 'studymax_profile_class';
const PROFILE_NUMBER_KEY = 'studymax_profile_number';
const PROFILE_PHOTO_KEY = 'studymax_profile_photo';
const AI_CONTENT_BANK_KEY = 'studymax_ai_content_bank_v1';
const AI_QUESTIONS_KEY = 'studymax_ai_questions_v1';
const AI_WIDGET_POSITION_KEY = 'studymax_ai_widget_position_v1';
const SIDEBAR_COLLAPSED_KEY = 'studymax_subject_sidebar_collapsed';
const SUBJECT_TAB_INK_SCOPE_NOTE = 'Dashboard, each subject, and each in-subject tab must keep separate ink storage whenever a subject adds tabbed content.';

function getClassNumberFromAccessCode() {
  const code = localStorage.getItem(ACCESS_CODE_KEY) || '';
  const m = code.match(/^(\d+)-(\d{2})$/);
  if (!m) return null;
  return { classNo: Number(m[1]), numberNo: Number(m[2]) };
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

  const fallback = getClassNumberFromAccessCode();
  classInput.value = localStorage.getItem(PROFILE_CLASS_KEY) || (fallback ? String(fallback.classNo) : '');
  numberInput.value = localStorage.getItem(PROFILE_NUMBER_KEY) || (fallback ? String(fallback.numberNo) : '');
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
  if (!localStorage.getItem(PROFILE_NAME_KEY) || !localStorage.getItem(PROFILE_CLASS_KEY) || !localStorage.getItem(PROFILE_NUMBER_KEY)) {
    modal.classList.add('show');
  }
}

function setActive(btn) {
  document.querySelectorAll('.menu button').forEach((b) => b.classList.remove('active'));
  versionToggleBtn?.classList.remove('active');
  btn?.classList.add('active');
}
function applySidebarState(collapsed) {
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  if (subjectToggleBtn) {
    subjectToggleBtn.setAttribute('aria-expanded', String(!collapsed));
    subjectToggleBtn.textContent = collapsed ? '과목' : '닫기';
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
  title.textContent = '기말 학습 대시보드';
  desc.textContent = '';
  if (window.syncInkContext) window.syncInkContext();
}
function showSubject(btn, heading) {
  setActive(btn);
  document.body.classList.add('subject-mode');
  dashPanel.classList.remove('active');
  if (versionPanel) versionPanel.classList.remove('active');
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
    if (window.syncInkContext) window.syncInkContext();
  };
  if (window.syncInkContext) window.syncInkContext();
}

function showVersionHistory(btn) {
  setActive(btn || versionToggleBtn);
  document.body.classList.remove('subject-mode');
  dashPanel.classList.remove('active');
  framePanel.classList.remove('active');
  if (versionPanel) versionPanel.classList.add('active');
  title.textContent = '업데이트 내역';
  desc.textContent = '학습 포털 변경 사항';
  if (window.syncInkContext) window.syncInkContext();
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

function bindFrameInkContextSync() {
  const doc = getNestedFrameDocument(frame);
  if (!doc || doc.body?.dataset.inkSyncBound === '1') return;
  if (doc.body) doc.body.dataset.inkSyncBound = '1';
  doc.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setTimeout(() => { if (window.syncInkContext) window.syncInkContext(); }, 30);
    });
  });
  const nested = frame?.contentDocument?.querySelector('iframe');
  if (nested && nested.dataset.inkSyncBound !== '1') {
    nested.dataset.inkSyncBound = '1';
    nested.addEventListener('load', () => {
      bindFrameInkContextSync();
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


renderDday();
loadGoal();
loadMemo();
initSubjectSidebarToggle();
if (goalSaveBtn) goalSaveBtn.addEventListener('click', saveGoal);
if (goalInput) goalInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveGoal(); });
if (memoSaveBtn) memoSaveBtn.addEventListener('click', saveMemo);
if (memoInput) memoInput.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveMemo(); });
initProfileModal();
initGlobalInk();
initMusicWidget();


function initMusicWidget() {
  const urlInput = document.getElementById('musicUrlInput');
  const addBtn = document.getElementById('musicAddBtn');
  const playBtn = document.getElementById('musicPlayBtn');
  const minBtn = document.getElementById('musicMinBtn');
  const dockToggleBtn = document.getElementById('musicDockToggle');
  const prevBtn = document.getElementById('musicPrevBtn');
  const nextBtn = document.getElementById('musicNextBtn');
  const listEl = document.getElementById('musicPlaylist');
  const msgEl = document.getElementById('musicMsg');
  const audio = document.getElementById('musicAudio');
  const youtubeFrame = document.getElementById('musicYoutubeFrame');
  const widget = document.getElementById('musicWidget');
  if (!urlInput || !addBtn || !playBtn || !prevBtn || !nextBtn || !listEl || !msgEl || !audio || !widget || !minBtn || !youtubeFrame || !dockToggleBtn) return;

  const MUSIC_LIST_KEY = 'studymax_music_playlist_v1';
  const MUSIC_INDEX_KEY = 'studymax_music_playlist_index_v1';
  const MUSIC_POSITION_KEY = 'studymax_music_position_v1';
  let playlist = [];
  let currentIndex = -1;
  let currentMode = 'audio';

  function markCustomPosition(custom) {
    widget.dataset.customPosition = custom ? '1' : '0';
    if (custom) widget.classList.remove('dock-left', 'dock-right');
  }

  function persistMusicPosition() {
    const rect = widget.getBoundingClientRect();
    localStorage.setItem(MUSIC_POSITION_KEY, JSON.stringify({ x: rect.left, y: rect.top }));
  }

  function applySavedMusicPosition() {
    try {
      const pos = JSON.parse(localStorage.getItem(MUSIC_POSITION_KEY) || 'null');
      if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return;
      const maxX = Math.max(0, window.innerWidth - widget.offsetWidth);
      const maxY = Math.max(0, window.innerHeight - widget.offsetHeight);
      widget.style.left = `${Math.max(0, Math.min(pos.x, maxX))}px`;
      widget.style.top = `${Math.max(0, Math.min(pos.y, maxY))}px`;
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
      markCustomPosition(true);
    } catch (_) {}
  }

  initMusicWidgetDrag(widget, () => { markCustomPosition(true); persistMusicPosition(); });
  applySavedMusicPosition();

  function setMsg(text) {
    msgEl.textContent = text;
    if (!text) return;
    setTimeout(() => { if (msgEl.textContent === text) msgEl.textContent = ''; }, 1800);
  }

  function persist() {
    localStorage.setItem(MUSIC_LIST_KEY, JSON.stringify(playlist));
    localStorage.setItem(MUSIC_INDEX_KEY, String(currentIndex));
  }

  function loadSaved() {
    try {
      const raw = localStorage.getItem(MUSIC_LIST_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) playlist = parsed.filter((x) => typeof x === 'string' && x.trim());
      const idx = Number(localStorage.getItem(MUSIC_INDEX_KEY));
      currentIndex = Number.isInteger(idx) && idx >= 0 && idx < playlist.length ? idx : (playlist.length ? 0 : -1);
    } catch (_) {
      playlist = [];
      currentIndex = -1;
    }
  }

  function labelFromUrl(url) {
    try {
      const u = new URL(url);
      return decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() || u.hostname);
    } catch (_) {
      return url;
    }
  }


  function parseYoutubeId(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1) || '';
      if (u.hostname.includes('youtube.com')) return u.searchParams.get('v') || '';
      return '';
    } catch (_) { return ''; }
  }
  function stopYoutube() {
    youtubeFrame.src = 'about:blank';
    youtubeFrame.style.display = 'none';
  }
  function stopAudio() {
    audio.pause();
    audio.removeAttribute('src');
  }

  function renderList() {
    listEl.innerHTML = '';
    playlist.forEach((url, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}. ${labelFromUrl(url)}`;
      li.classList.toggle('active', i === currentIndex);
      li.title = url;
      li.addEventListener('click', () => {
        currentIndex = i;
        loadCurrent(true);
      });
      listEl.appendChild(li);
    });
  }

  function loadCurrent(autoplay = false) {
    if (currentIndex < 0 || currentIndex >= playlist.length) {
      audio.removeAttribute('src');
      playBtn.textContent = '▶️ 재생';
      renderList();
      persist();
      return;
    }
    const rawUrl = playlist[currentIndex];
    const yid = parseYoutubeId(rawUrl);
    if (yid) {
      currentMode = 'youtube';
      stopAudio();
      youtubeFrame.style.display = 'block';
      youtubeFrame.src = `https://www.youtube.com/embed/${yid}?autoplay=${autoplay ? 1 : 0}&rel=0`;
      playBtn.textContent = autoplay ? '⏸ 일시정지' : '▶️ 재생';
    } else {
      currentMode = 'audio';
      stopYoutube();
      audio.src = rawUrl;
      audio.load();
      if (autoplay) {
        audio.play().then(() => { playBtn.textContent = '⏸ 일시정지'; }).catch(() => {
          setMsg('브라우저 정책으로 자동 재생이 차단될 수 있어요. 재생 버튼을 눌러주세요.');
        });
      }
    }
    renderList();
    persist();
  }

  function addUrl() {
    const url = (urlInput.value || '').trim();
    if (!url) { setMsg('URL을 입력해 주세요.'); return; }
    try { new URL(url); } catch (_) { setMsg('유효한 URL 형식이 아닙니다.'); return; }
    playlist.push(url);
    if (currentIndex === -1) currentIndex = 0;
    urlInput.value = '';
    loadCurrent(false);
    setMsg('재생목록에 추가되었습니다.');
  }

  function move(delta) {
    if (!playlist.length) { setMsg('재생목록이 비어 있습니다.'); return; }
    currentIndex = (currentIndex + delta + playlist.length) % playlist.length;
    loadCurrent(true);
  }

  let autoMinTimer = null;
  function scheduleAutoMinimize() {
    clearTimeout(autoMinTimer);
    autoMinTimer = setTimeout(() => { setDockState(true); }, 1500);
  }

  addBtn.addEventListener('click', addUrl);
  urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addUrl(); });
  playBtn.addEventListener('click', () => {
    if (!playlist.length) { setMsg('먼저 URL을 추가해 주세요.'); return; }
    if (!audio.src) loadCurrent(false);
    if (currentMode === 'youtube') {
      const yid = parseYoutubeId(playlist[currentIndex] || '');
      if (!yid) return;
      const isPaused = playBtn.textContent.includes('재생');
      youtubeFrame.src = `https://www.youtube.com/embed/${yid}?autoplay=${isPaused ? 1 : 0}&rel=0`;
      playBtn.textContent = isPaused ? '⏸ 일시정지' : '▶️ 재생';
      if (isPaused) scheduleAutoMinimize();
      return;
    }
    if (audio.paused) {
      audio.play().then(() => { playBtn.textContent = '⏸ 일시정지'; }).catch(() => setMsg('재생할 수 없는 URL입니다. 오디오 파일 URL인지 확인해 주세요.'));
    } else {
      audio.pause();
      playBtn.textContent = '▶️ 재생';
    }
  });
  prevBtn.addEventListener('click', () => move(-1));
  nextBtn.addEventListener('click', () => move(1));
  audio.addEventListener('ended', () => move(1));
  const miniPauseBtn = document.getElementById('musicMiniPauseBtn');
  function syncMiniPause(playing) {
    if (miniPauseBtn) miniPauseBtn.textContent = playing ? '⏸' : '▶️';
  }

  audio.addEventListener('play', () => { playBtn.textContent = '⏸ 일시정지'; syncMiniPause(true); scheduleAutoMinimize(); });
  audio.addEventListener('pause', () => { clearTimeout(autoMinTimer); playBtn.textContent = '▶️ 재생'; syncMiniPause(false); });
  audio.addEventListener('error', () => { setMsg('오디오를 불러오지 못했습니다. URL을 확인해 주세요.'); });

  if (miniPauseBtn) {
    miniPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!playlist.length) return;
      if (currentMode === 'youtube') {
        const yid = parseYoutubeId(playlist[currentIndex] || '');
        if (!yid) return;
        const isPlaying = miniPauseBtn.textContent === '⏸';
        youtubeFrame.src = `https://www.youtube.com/embed/${yid}?autoplay=${isPlaying ? 0 : 1}&rel=0`;
        playBtn.textContent = isPlaying ? '▶️ 재생' : '⏸ 일시정지';
        syncMiniPause(!isPlaying);
      } else if (!audio.paused) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
    });
  }

  function setDockState(minimized) {
    if (widget.dataset.customPosition !== '1') {
      widget.classList.remove('dock-left');
      widget.classList.add('dock-right');
    } else {
      widget.classList.remove('dock-left', 'dock-right');
    }
    widget.classList.toggle('minimized', minimized);
    minBtn.title = minimized ? '펼치기' : '최소화';
    minBtn.textContent = minimized ? '＋' : '－';
    dockToggleBtn.textContent = minimized ? '🎵 BGM' : '숨기기';
    dockToggleBtn.title = minimized ? '펼치기' : '숨기기';
    if (!minimized) clearTimeout(autoMinTimer);
  }

  minBtn.addEventListener('click', () => {
    setDockState(!widget.classList.contains('minimized'));
  });

  dockToggleBtn.addEventListener('click', () => {
    const minimized = widget.classList.contains('minimized');
    setDockState(!minimized);
  });

  loadSaved();
  renderList();
  if (currentIndex >= 0) loadCurrent(false);
}


function initMusicWidgetDrag(widget, onDragEnd) {
  const grip = document.getElementById('musicGrip');
  if (!grip || !widget) return;
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const move = (e) => {
    if (!dragging) return;
    const nx = e.clientX - offsetX;
    const ny = e.clientY - offsetY;
    const maxX = window.innerWidth - widget.offsetWidth;
    const maxY = window.innerHeight - widget.offsetHeight;
    widget.style.left = `${Math.max(0, Math.min(nx, maxX))}px`;
    widget.style.top = `${Math.max(0, Math.min(ny, maxY))}px`;
    e.preventDefault();
  };

  const end = (e) => {
    if (!dragging) return;
    dragging = false;
    widget.classList.remove('dragging');
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
    try { grip.releasePointerCapture(e.pointerId); } catch (_) {}
    if (typeof onDragEnd === 'function') onDragEnd();
  };

  grip.addEventListener('pointerdown', (e) => {
    dragging = true;
    widget.classList.add('dragging');
    const rect = widget.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    widget.style.left = `${rect.left}px`;
    widget.style.top = `${rect.top}px`;
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
    widget.classList.remove('dock-left', 'dock-right');
    try { grip.setPointerCapture(e.pointerId); } catch (_) {}
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    e.preventDefault();
  }, { passive: false });
}

initAiCoach();



function extractTextFromCurrentFrame() {
  const doc = getNestedFrameDocument(frame);
  if (!doc) return '';
  const bodyText = doc.body ? doc.body.innerText : '';
  return (bodyText || '').replace(/\s+/g, ' ').trim();
}

async function requestAiFromApi(raw) {
  const apiUrl = `${window.location.origin}/api/ai/analyze`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: raw, lang: 'ko', mode: 'study_coach' })
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}

function persistAiResult(summaryPoints, questions, sourceLength) {
  const bank = JSON.parse(localStorage.getItem(AI_CONTENT_BANK_KEY) || '[]');
  bank.push({ date: new Date().toISOString().slice(0, 10), length: sourceLength, points: summaryPoints });
  localStorage.setItem(AI_CONTENT_BANK_KEY, JSON.stringify(bank.slice(-200)));
  localStorage.setItem(AI_QUESTIONS_KEY, JSON.stringify(questions));
}

async function runAiLearning(raw) {
  try {
    const apiResult = await requestAiFromApi(raw);
    if (apiResult && Array.isArray(apiResult.questions)) {
      const points = Array.isArray(apiResult.summary_points) ? apiResult.summary_points.slice(0, 3) : [];
      persistAiResult(points, apiResult.questions, raw.length);
      aiMsgEl.textContent = `API 학습 완료: 핵심 포인트 ${points.length}개, 문제 ${apiResult.questions.length}개 생성`;
  renderAiCoach();
  renderAiQuizCards();
      return;
    }
  } catch (e) {
    aiMsgEl.textContent = `API 호출 실패 (${e.message}). 로컬 모드로 전환합니다.`;
  }

  const summary = summarizeForAi(raw);
  const questions = buildQuestionsFromText(raw);
  persistAiResult(summary.points, questions, summary.totalLength);
  aiMsgEl.textContent = `로컬 학습 완료: 핵심 포인트 ${summary.points.length}개, 문제 ${questions.length}개 생성`;
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
    aiSummaryEl.textContent = `누적 학습 데이터 ${bank.length}건 · 최근 입력 ${last.date} · 길이 ${last.length}자`;
  } else {
    aiSummaryEl.textContent = '아직 학습 데이터가 없습니다.';
  }
}

function renderAiQuizCards() {
  if (!aiQuizCardsEl) return;
  const questions = JSON.parse(localStorage.getItem(AI_QUESTIONS_KEY) || '[]');
  aiQuizCardsEl.innerHTML = '';
  if (!Array.isArray(questions) || !questions.length) {
    const empty = document.createElement('p');
    empty.className = 'ai-sub';
    empty.textContent = '아직 생성된 문제가 없습니다.';
    aiQuizCardsEl.appendChild(empty);
    return;
  }
  questions.forEach((q, idx) => {
    const card = document.createElement('article');
    card.className = 'ai-quiz-card';
    const title = document.createElement('h4');
    title.textContent = `문제 ${idx + 1}`;
    const body = document.createElement('p');
    body.textContent = String(q);
    const answer = document.createElement('textarea');
    answer.placeholder = '여기에 답안을 입력하세요.';
    const checkBtn = document.createElement('button');
    checkBtn.type = 'button';
    checkBtn.textContent = '답안 저장';
    const feedback = document.createElement('div');
    feedback.className = 'ai-feedback';
    checkBtn.addEventListener('click', () => {
      const v = (answer.value || '').trim();
      feedback.textContent = v ? '답안이 저장되었습니다. (자가점검용)' : '답안을 입력해 주세요.';
    });
    card.append(title, body, answer, checkBtn, feedback);
    aiQuizCardsEl.appendChild(card);
  });
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

  aiAnalyzeBtn.addEventListener('click', () => {
    const raw = (aiSourceInput.value || '').trim();
    if (!raw) { aiMsgEl.textContent = '학습 내용을 입력해 주세요.'; return; }
    runAiLearning(raw);
    aiSourceInput.value = '';
  });

  aiAnalyzeFrameBtn.addEventListener('click', () => {
    const raw = extractTextFromCurrentFrame();
    if (!raw) { aiMsgEl.textContent = '현재 학습 페이지에서 분석할 텍스트를 찾지 못했습니다.'; return; }
    runAiLearning(raw);
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
