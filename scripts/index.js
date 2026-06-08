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
