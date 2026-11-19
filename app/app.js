const STORAGE_KEY = 'leonida-field-guide-progress-v1';
const SPOILER_KEY = 'leonida-field-guide-spoilers-v1';
const rows = document.querySelector('#rows');
const gradeFilter = document.querySelector('#grade');
const kindFilter = document.querySelector('#kind');
const searchInput = document.querySelector('#search');
const spoilerToggle = document.querySelector('#spoilers');
const guide = await (await fetch('data/trophies.json')).json();
const trophies = guide.trophies;
let earned = new Set(readProgress());

function readProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.filter(name => typeof name === 'string') : [];
  } catch { return []; }
}
function saveProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned])); }
function escapeText(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function isSpoiled(trophy) { return spoilerToggle.checked && !earned.has(trophy.name) && (trophy.kind === 'story' || trophy.hidden === true); }
function gradeClass(grade) { return `grade-${grade}`; }
function updateProgress() {
  const total = trophies.length;
  const count = trophies.filter(t => earned.has(t.name)).length;
  const pct = Math.round(count / total * 100);
  document.querySelector('#progress-count').innerHTML = `${count} <small>/ ${total}</small>`;
  document.querySelector('#progress-percent').textContent = `${pct}% complete`;
  document.querySelector('#ring-value').textContent = `${pct}%`;
  document.querySelector('#progress-ring').style.background = `conic-gradient(var(--orange) ${pct * 3.6}deg,#34494a ${pct * 3.6}deg)`;
  document.querySelector('#progress-ring').setAttribute('aria-label', `${pct} percent complete`);
  document.querySelector('#progress-fill').style.width = `${pct}%`;
  document.querySelector('#grade-progress').innerHTML = ['platinum','gold','silver','bronze'].map(grade => {
    const list = trophies.filter(t => t.grade === grade);
    const done = list.filter(t => earned.has(t.name)).length;
    return `<span class="grade-stat">${grade.toUpperCase()}<strong>${done}/${list.length}</strong></span>`;
  }).join('');
}
function trophyCard(trophy) {
  const checked = earned.has(trophy.name);
  const masked = isSpoiled(trophy);
  const displayName = masked ? 'Story details hidden' : trophy.name;
  const displayDescription = masked ? 'Earn this trophy to reveal its description.' : trophy.description;
  const warning = trophy.missable ? '<span class="badge missable">! Check before moving on</span>' : '';
  const guideText = escapeText(trophy.guide).replace(/Sources:/g, '<strong>Sources:</strong>');
  return `<article class="trophy-card${checked ? ' earned' : ''}">
    <div class="check-wrap"><input class="earned-check" type="checkbox" aria-label="Mark ${escapeText(trophy.name)} earned" ${checked ? 'checked' : ''} data-name="${escapeText(trophy.name)}"></div>
    <div><div class="card-top"><span class="grade-glyph ${gradeClass(trophy.grade)}" title="${escapeText(trophy.grade)}"><span>${trophy.grade[0].toUpperCase()}</span></span><div class="title-block"><h3 class="trophy-name${masked ? ' spoiler-mask' : ''}">${escapeText(displayName)}</h3><p class="trophy-desc">${escapeText(displayDescription)}</p></div><div class="badges"><span class="badge">${escapeText(trophy.kind)}</span>${warning}</div></div><p class="guide-text">${guideText}</p></div>
  </article>`;
}
function renderChecklist() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const visible = trophies.filter(t => (gradeFilter.value === 'all' || t.grade === gradeFilter.value) && (kindFilter.value === 'all' || t.kind === kindFilter.value) && (!query || t.name.toLocaleLowerCase().includes(query)));
  rows.innerHTML = visible.map(trophyCard).join('');
  document.querySelector('#result-count').textContent = visible.length;
  document.querySelector('#empty-state').hidden = visible.length !== 0;
  rows.querySelectorAll('.earned-check').forEach(box => box.addEventListener('change', () => {
    if (box.checked) earned.add(box.dataset.name); else earned.delete(box.dataset.name);
    saveProgress(); render();
  }));
  updateProgress();
}
function renderRoadmap() {
  const titles = {1:'Story route',2:'Keep these on your radar',3:'Character strands & side goals',4:'Statewide cleanup',5:'The platinum'};
  const descriptions = {1:'Complete the listed story milestones in sequence.',2:'Descriptions tie these awards to a named mission or choice; review side goals as you progress.',3:'Finish character finales and stranger strands before your final cleanup.',4:'Sweep the collectibles, activities and broad completion goals.',5:'Close the set after the other 54 trophies.'};
  const stages = [1,2,3,4,5];
  document.querySelector('#roadmap').innerHTML = stages.map(stage => {
    let items;
    if (stage === 1) items = trophies.filter(t => t.id <= 13);
    else if (stage === 2) items = trophies.filter(t => t.missable && t.id > 13);
    else if (stage === 3) items = trophies.filter(t => t.stage === 3 && !t.missable);
    else if (stage === 4) items = trophies.filter(t => t.stage === 4 && t.name !== 'Vice Got a Price!');
    else items = trophies.filter(t => t.grade === 'platinum');
    return `<section class="stage"><div class="stage-head"><span class="stage-number">STAGE 0${stage}</span><h3>${titles[stage]}</h3><p>${descriptions[stage]}</p></div><div class="stage-items">${items.map(t => `<div class="roadmap-item${earned.has(t.name) ? ' done' : ''}">${t.missable ? '<span class="warning-mark">!</span>' : '<span class="mini-box"></span>'}<span>${escapeText(t.name)}</span><small>${t.grade}</small></div>`).join('')}</div></section>`;
  }).join('');
}
function setView(view) {
  const checklist = view === 'checklist';
  document.querySelector('#checklist-view').hidden = !checklist;
  document.querySelector('#roadmap-view').hidden = checklist;
  document.querySelector('#checklist-tab').classList.toggle('active', checklist);
  document.querySelector('#roadmap-tab').classList.toggle('active', !checklist);
  if (!checklist) renderRoadmap();
}
function applyShotHooks() {
  const params = new URLSearchParams(location.search);
  const grade = params.get('grade');
  if (['platinum','gold','silver','bronze'].includes(grade)) gradeFilter.value = grade;
  renderChecklist();
  const scroll = Number(params.get('scroll'));
  if (Number.isFinite(scroll) && scroll > 0) requestAnimationFrame(() => window.scrollTo(0, scroll));
}
spoilerToggle.checked = localStorage.getItem(SPOILER_KEY) === 'true';
[gradeFilter,kindFilter].forEach(control => control.addEventListener('change', renderChecklist));
searchInput.addEventListener('input', renderChecklist);
spoilerToggle.addEventListener('change', () => { localStorage.setItem(SPOILER_KEY, String(spoilerToggle.checked)); renderChecklist(); });
document.querySelector('#checklist-tab').addEventListener('click', () => setView('checklist'));
document.querySelector('#roadmap-tab').addEventListener('click', () => setView('roadmap'));
document.querySelector('#export').addEventListener('click', () => {
  const payload = JSON.stringify({schema:'leonida-progress/v1', earned:[...earned], exportedAt:new Date().toISOString()}, null, 2);
  const url = URL.createObjectURL(new Blob([payload], {type:'application/json'}));
  const link = document.createElement('a'); link.href = url; link.download = 'leonida-trophy-progress.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.querySelector('#import').addEventListener('change', async event => {
  const file = event.target.files?.[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names) || names.some(name => typeof name !== 'string')) throw new Error('Invalid progress file');
    const valid = new Set(trophies.map(t => t.name));
    earned = new Set(names.filter(name => valid.has(name)));
    saveProgress(); renderChecklist();
  } catch { alert('Could not import this file. Choose a Leonida Field Guide progress JSON.'); }
  event.target.value = '';
});
applyShotHooks();
