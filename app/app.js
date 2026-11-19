const STORAGE_KEY = 'leonida-field-guide-progress-v1';
const gradeOrder = ['platinum', 'gold', 'silver', 'bronze'];
const stages = [
  { number: 1, title: 'Build the story foundation', note: 'Clear the listed early chapters and mission beats in the sequence the list presents.' },
  { number: 2, title: 'Finish story strands', note: 'Complete the named character strands and chapter objectives as they become available.' },
  { number: 3, title: 'Close the main story', note: 'The final mission trophy sits after the earlier story milestones.' },
  { number: 4, title: 'Sweep collections and exploration', note: 'Use collection and discovery tracking for state-wide requirements.' },
  { number: 5, title: 'Finish activities and open-world goals', note: 'Work through repeatable challenges, races, robberies, and other listed activities.' },
  { number: 6, title: 'Claim the platinum', note: 'Earn the remaining trophies; this is the final reward in the list.' }
];
const stageByTrophy = new Map();
function loadProgress() {
  try { const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return new Set(Array.isArray(stored) ? stored.filter(x => typeof x === 'string') : []); }
  catch { return new Set(); }
}
let trophies = [];
let earned = loadProgress();
const cards = document.getElementById('cards');
const gradeFilter = document.getElementById('grade');
const kindFilter = document.getElementById('kind');
const search = document.getElementById('search');
const spoilers = document.getElementById('spoilers');
function safeText(tag, className, content) { const el = document.createElement(tag); if (className) el.className = className; el.textContent = content; return el; }
function saveProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned])); }
function renderProgress() {
  const done = trophies.filter(t => earned.has(t.name)).length;
  const percent = trophies.length ? Math.round(done / trophies.length * 100) : 0;
  document.getElementById('progress').textContent = `${done} / ${trophies.length}`;
  document.getElementById('percent').textContent = `${percent}% complete`;
  document.getElementById('progress-bar').style.width = `${percent}%`;
  const strip = document.getElementById('grade-summary'); strip.replaceChildren();
  for (const grade of gradeOrder) {
    const group = trophies.filter(t => t.grade === grade), count = group.filter(t => earned.has(t.name)).length;
    const stat = document.createElement('div'); stat.className = 'grade-stat';
    stat.append(safeText('span', '', grade), safeText('strong', '', `${count} / ${group.length}`)); strip.append(stat);
  }
}
function visibleTrophy(t) {
  const concealed = spoilers.checked && !earned.has(t.name) && (t.kind === 'story' || t.hidden === true);
  return { name: concealed ? 'Story spoiler' : t.name, description: concealed ? 'Earn this trophy to reveal its details.' : t.description, concealed };
}
function makeCard(t) {
  const card = document.createElement('article'); card.className = `trophy-card${earned.has(t.name) ? ' earned' : ''}`;
  const box = document.createElement('input'); box.type = 'checkbox'; box.className = 'check'; box.checked = earned.has(t.name); box.setAttribute('aria-label', `Mark ${t.name} earned`);
  box.addEventListener('change', () => { box.checked ? earned.add(t.name) : earned.delete(t.name); saveProgress(); render(); });
  const content = document.createElement('div'); content.className = 'card-content';
  const shown = visibleTrophy(t); const titleRow = document.createElement('div'); titleRow.className = 'card-title-row';
  titleRow.append(safeText('h3', 'card-title', shown.name), safeText('span', `grade-tag ${t.grade}`, t.grade));
  content.append(titleRow, safeText('p', 'description', shown.description));
  if (!shown.concealed) { content.append(safeText('p', 'guide', t.guide)); content.append(safeText('small', 'citation', `SOURCE · ${t.sources}`)); }
  const meta = document.createElement('div'); meta.className = 'card-meta'; meta.append(safeText('span', 'kind-tag', t.kind));
  card.append(box, content, meta);
  if (t.missable) card.append(safeText('div', 'missable-flag', '⚠ Mission-linked · check before advancing past named content'));
  return card;
}
function renderCards() {
  cards.replaceChildren(); const needle = search.value.trim().toLocaleLowerCase();
  const filtered = trophies.filter(t => (gradeFilter.value === 'all' || t.grade === gradeFilter.value) && (kindFilter.value === 'all' || t.kind === kindFilter.value || (kindFilter.value === 'missable' && t.missable)) && t.name.toLocaleLowerCase().includes(needle));
  document.getElementById('result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'trophy' : 'trophies'} shown`;
  if (!filtered.length) { cards.append(safeText('div', 'empty-state', 'No trophies match those filters. Try another grade, kind, or search.')); return; }
  filtered.forEach(t => cards.append(makeCard(t)));
}
function renderRoadmap() {
  const root = document.getElementById('roadmap'); root.replaceChildren();
  for (const stage of stages) {
    const section = document.createElement('section'); section.className = 'stage';
    section.append(safeText('span', 'stage-number', String(stage.number)), safeText('h3', '', stage.title), safeText('p', 'stage-note', stage.note));
    const list = document.createElement('div'); list.className = 'road-items';
    const entries = trophies.filter(t => t.stage === stage.number);
    if (!entries.length) list.append(safeText('p', 'road-empty', 'No listed trophies in this stage.'));
    for (const t of entries) { const item = document.createElement('div'); item.className = `road-item${t.missable ? ' warning' : ''}`; item.append(safeText('span', '', t.name), safeText('small', '', t.missable ? '⚠ mission-linked' : t.grade)); list.append(item); }
    section.append(list); root.append(section);
  }
}
function render() { renderProgress(); renderCards(); }
for (const tab of document.querySelectorAll('.tab')) tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === tab));
  document.querySelectorAll('.view').forEach(x => x.classList.toggle('active', x.id === `${tab.dataset.view}-view`));
});
[gradeFilter, kindFilter, spoilers].forEach(el => el.addEventListener('change', render));
search.addEventListener('input', renderCards);
document.getElementById('export').addEventListener('click', () => {
  const payload = { format: 'leonida-field-guide-progress-v1', earned: [...earned] };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'leonida-trophy-progress.json'; link.click(); URL.revokeObjectURL(url);
});
document.getElementById('import').addEventListener('change', async event => {
  const file = event.target.files?.[0]; if (!file) return;
  try { const payload = JSON.parse(await file.text()); const names = Array.isArray(payload) ? payload : payload.earned; if (!Array.isArray(names)) throw new Error('Expected an earned trophy list');
    const valid = new Set(trophies.map(t => t.name)); earned = new Set(names.filter(name => typeof name === 'string' && valid.has(name))); saveProgress(); render();
  } catch { alert('That progress file could not be read. Choose a JSON export from this guide.'); }
  event.target.value = '';
});
async function start() {
  const response = await fetch('data/trophies.json'); const data = await response.json(); trophies = data.trophies;
  // Preserve every starter trophy while assigning a staged path suitable for the in-app roadmap.
  for (const t of trophies) stageByTrophy.set(t.name, t.stage);
  const params = new URLSearchParams(location.search);
  const requestedGrade = params.get('grade');
  if (gradeOrder.includes(requestedGrade)) gradeFilter.value = requestedGrade;
  renderRoadmap(); render();
  const scroll = Number(params.get('scroll'));
  if (Number.isFinite(scroll) && scroll > 0) requestAnimationFrame(() => window.scrollTo(0, scroll));
}
start();
