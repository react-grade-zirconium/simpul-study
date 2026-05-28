const line1 = document.getElementById('line1');
const line2 = document.getElementById('line2');
const finalLine = document.getElementById('finalLine');
const classInput = document.getElementById('classInput');
const numberInput = document.getElementById('numberInput');
const codeSaveBtn = document.getElementById('codeSaveBtn');
const codeMsg = document.getElementById('codeMsg');
const startBtn = document.getElementById('startStudyBtn');

const ACCESS_CODE_KEY = 'studymax_access_code';
const ACCESS_USER_KEY = 'studymax_access_user';
const ACCESS_SERVER_CODE_KEY = 'studymax_access_server_code';
const ACCESS_BIND_MODE_KEY = 'studymax_access_bind_mode';
const DEVICE_ID_KEY = 'studymax_device_id';
const MASTER_CODE = 'simpul';

const CLASS_MIN = 1;
const CLASS_MAX = 8;
const NUMBER_MIN = 1;
const NUMBER_MAX = 35;

const FIRST_FULL = '심규원·최시원의';
const SECOND_FULL = '풀서비스 스터디';
const FINAL_TEXT = '심풀 스터디';

function getOrCreateDeviceId() {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const created = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(DEVICE_ID_KEY, created);
  return created;
}


function typeTo(el, text, duration = 900) {
  el.classList.add('typing');
  el.textContent = text;
  el.style.maxWidth = '0px';
  requestAnimationFrame(() => {
    const target = el.scrollWidth;
    el.style.transition = `max-width ${duration}ms steps(${Math.max(text.length, 6)}, end)`;
    el.style.maxWidth = `${target}px`;
  });
}
function freeze(el) { el.classList.remove('typing'); el.style.transition = 'none'; el.style.maxWidth = 'none'; el.style.borderRight = 'none'; }
function reduceFirstLineToShim() { line1.innerHTML = '<span id="shimCore" class="shim-core morph-piece">심</span><span id="fadeName" class="fade-name">규원·최시원의</span>'; }
function removeServiceFromSecondLine() { line2.innerHTML = '<span id="leftKeep" class="left-keep morph-piece">풀</span><span id="fadeService" class="fade-service">서비스</span><span class="line-gap" aria-hidden="true">&nbsp;</span><span id="rightKeep" class="right-keep morph-piece">스터디</span>'; }
function showFinalMergedLine() { finalLine.textContent = FINAL_TEXT; finalLine.classList.add('show-final'); }
function morphIntoFinalLine() {
  document.querySelector('.hero')?.classList.add('collapse-lines');
  setTimeout(() => { showFinalMergedLine(); }, 300);
}


function parseClassNumberInput() {
  const classNo = Number(classInput?.value ?? '');
  const numberNo = Number(numberInput?.value ?? '');
  if (!Number.isInteger(classNo) || !Number.isInteger(numberNo)) {
    return { ok: false, message: '반/번호를 숫자로 입력해 주세요.' };
  }
  if (classNo < CLASS_MIN || classNo > CLASS_MAX) {
    return { ok: false, message: '반은 1~8 사이만 입력할 수 있습니다.' };
  }
  if (numberNo < NUMBER_MIN || numberNo > NUMBER_MAX) {
    return { ok: false, message: '번호는 1~35 사이만 입력할 수 있습니다.' };
  }
  const code = `${classNo}-${String(numberNo).padStart(2, '0')}`;
  return { ok: true, classNo, numberNo, code, label: `${classNo}반 ${numberNo}번` };
}

function fillInputsFromCode(code) {
  const m = code && code.match(/^(\d+)-(\d{2})$/);
  if (!m) return false;
  const classNo = Number(m[1]);
  const numberNo = Number(m[2]);
  if (classNo < CLASS_MIN || classNo > CLASS_MAX || numberNo < NUMBER_MIN || numberNo > NUMBER_MAX) return false;
  if (classInput) classInput.value = String(classNo);
  if (numberInput) numberInput.value = String(numberNo);
  return true;
}



async function saveCode() {
  if ((classInput?.value || '').trim().toLowerCase() === MASTER_CODE) {
    localStorage.setItem(ACCESS_CODE_KEY, MASTER_CODE);
    localStorage.setItem(ACCESS_USER_KEY, '마스터 코드');
    localStorage.setItem(ACCESS_BIND_MODE_KEY, 'local');
    codeMsg.textContent = '마스터 코드 저장 완료';
    return true;
  }
  const parsed = parseClassNumberInput();
  if (!parsed.ok) {
    codeMsg.textContent = parsed.message;
    return false;
  }
  const code = parsed.code;
  localStorage.setItem(ACCESS_CODE_KEY, code);
  localStorage.setItem(ACCESS_USER_KEY, parsed.label);
  codeMsg.textContent = `${parsed.label} 코드 저장 완료 (로컬 저장)`;
  return true;
}

async function hasValidCodeForThisDevice() {
  const code = localStorage.getItem(ACCESS_CODE_KEY);
  if (code === MASTER_CODE) return true;
  if (!code || !fillInputsFromCode(code)) return false;
  return true;
}

function loadCode() {
  const code = localStorage.getItem(ACCESS_CODE_KEY);
  if (code === MASTER_CODE) {
    if (classInput) classInput.value = code;
    if (numberInput) numberInput.value = '';
    codeMsg.textContent = '마스터 코드가 등록되어 있습니다.';
    return;
  }
  if (code && fillInputsFromCode(code)) {
    const classNo = Number(classInput?.value || 0);
    const numberNo = Number(numberInput?.value || 0);
    codeMsg.textContent = `${classNo}반 ${numberNo}번 코드가 등록되어 있습니다.`;
  }
}

if (finalLine) { finalLine.textContent = ''; finalLine.classList.remove('show-final'); }

typeTo(line1, FIRST_FULL, 900);
setTimeout(() => { freeze(line1); typeTo(line2, SECOND_FULL, 850); }, 1100);
setTimeout(() => { freeze(line2); }, 2100);
setTimeout(() => { reduceFirstLineToShim(); removeServiceFromSecondLine(); }, 3600);
setTimeout(() => { morphIntoFinalLine(); }, 5200);

getOrCreateDeviceId();
loadCode();
codeSaveBtn?.addEventListener('click', () => { saveCode(); });
classInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveCode(); });
numberInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveCode(); });
startBtn?.addEventListener('click', async (e) => {
  if (await hasValidCodeForThisDevice()) return;
  e.preventDefault();
  codeMsg.textContent = '이 기기에 1:1로 등록된 유효 코드가 필요합니다.';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
