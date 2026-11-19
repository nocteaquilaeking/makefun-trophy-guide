const SAVE_KEY = 'leonida-field-guide-progress-v1';
const grades = ['platinum', 'gold', 'silver', 'bronze'];
const stages = [
  ['Build the story foundation', 'Clear the listed early chapters and mission beats in sequence.'],
  ['Finish story strands', 'Complete character strands and chapter objectives as they become available.'],
  ['Close the main story', 'The final mission trophy follows the earlier story milestones.'],
  ['Sweep collections and exploration', 'Use collection and discovery tracking for state-wide requirements.'],
  ['Finish activities and open-world goals', 'Work through challenges, races, robberies, and other activities.'],
  ['Claim the platinum', 'Earn the remaining trophies to finish the list.']
];
const byId = id => document.getElementById(id);
const make = (tag, cls = '', text = '') => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  el.textContent = text;
  return el;
};
let trophies = [];
let earned = new Set();
try {
  const stored = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]');
  if (Array.isArray(stored)) earned = new Set(stored.filter(x => typeof x === 'string'));
} catch { earned = new Set(); }
const field = (t, key) => t[key];
const filtered = () => {
  const phrase = byId('search').value.trim().toLocaleLowerCase();
  const grade = byId('grade').value;
  const kind = byId('kind').value;
  return trophies.filter(t => (grade === 'all' || t.grade === grade) &&
    (kind === 'all' || t.kind === kind || (kind === 'missable' && t.missable)) &&
    t.name.toLocaleLowerCase().includes(phrase));
};
const save = () => localStorage.setItem(SAVE_KEY, JSON.stringify([...earned]));
function totals() {
  const count = trophies.filter(t => earned.has(t.name)).length;
  const percent = trophies.length ? Math.round(count * 100 / trophies.length) : 0;
  byId('progress').textContent = `${count} / ${trophies.length}`;
  byId('percent').textContent = `${percent}% complete`;
  byId('progress-bar').style.width = `${percent}%`;
  const summary = byId('grade-summary'); summary.replaceChildren();
  grades.forEach(grade => {
    const set = trophies.filter(t => t.grade === grade);
    const tile = make('button', 'grade-stat'); tile.type = 'button';
    tile.setAttribute('aria-label', `Filter by ${grade} grade`);
    tile.setAttribute('aria-pressed', String(byId('grade').value === grade));
    tile.append(make('span', '', grade), make('strong', '', `${set.filter(t => earned.has(t.name)).length} / ${set.length}`));
    tile.addEventListener('click', () => {
      byId('grade').value = byId('grade').value === grade ? 'all' : grade;
      render();
    });
    summary.append(tile);
  });
}
function card(t) {
  const done = earned.has(t.name);
  const article = make('article', `trophy-card${done ? ' earned' : ''}`);
  const check = make('input', 'check'); check.type = 'checkbox'; check.checked = done;
  check.setAttribute('aria-label', `Mark ${t.name} earned`);
  check.addEventListener('change', () => { check.checked ? earned.add(t.name) : earned.delete(t.name); save(); render(); });
  const body = make('div', 'card-content');
  const row = make('div', 'card-title-row');
  const hide = byId('spoilers').checked && !done && t.kind === 'story';
  row.append(make('h3', 'card-title', hide ? 'Story spoiler' : t.name), make('span', `grade-tag ${t.grade}`, t.grade));
  body.append(row, make('p', 'description', hide ? 'Earn this trophy to reveal its details.' : t.description));
  if (!hide) {
    body.append(make('p', 'guide', t.guide));
    body.append(make('small', 'citation', `SOURCE · ${t.sources}`));
  }
  const meta = make('div', 'card-meta'); meta.append(make('span', 'kind-tag', t.kind));
  article.append(check, body, meta);
  if (t.missable) article.append(make('div', 'missable-flag', '⚠ Mission-linked · check before advancing past named content'));
  return article;
}
function renderCards() {
  const list = filtered(); const area = byId('cards'); area.replaceChildren();
  byId('result-count').textContent = `${list.length} ${list.length === 1 ? 'trophy' : 'trophies'} shown`;
  if (!list.length) area.append(make('div', 'empty-state', 'No trophies match these filters.'));
  list.forEach(t => area.append(card(t)));
}
function renderRoadmap() {
  const root = byId('roadmap'); root.replaceChildren();
  stages.forEach(([title, note], index) => {
    const panel = make('section', 'stage');
    panel.append(make('span', 'stage-number', String(index + 1)), make('h3', '', title), make('p', 'stage-note', note));
    const items = make('div', 'road-items');
    const members = trophies.filter(t => t.stage === index + 1);
    members.forEach(t => {
      const line = make('div', `road-item${t.missable ? ' warning' : ''}`);
      line.append(make('span', '', t.name), make('small', '', t.missable ? '⚠ mission-linked' : t.grade)); items.append(line);
    });
    if (!members.length) items.append(make('p', 'road-empty', 'No listed trophies in this stage.'));
    panel.append(items); root.append(panel);
  });
}
function render() { totals(); renderCards(); }
byId('grade').addEventListener('change', render);
byId('kind').addEventListener('change', render);
byId('spoilers').addEventListener('change', render);
byId('search').addEventListener('input', renderCards);
byId('earn-visible').addEventListener('click', () => { filtered().forEach(t => earned.add(t.name)); save(); render(); });
byId('clear-visible').addEventListener('click', () => { filtered().forEach(t => earned.delete(t.name)); save(); render(); });
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(item => item.classList.toggle('active', item === tab));
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `${tab.dataset.view}-view`));
}));
byId('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ format: SAVE_KEY, earned: [...earned] }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'leonida-trophy-progress.json'; link.click(); URL.revokeObjectURL(link.href);
});
byId('import').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text()); const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('Invalid progress data');
    const known = new Set(trophies.map(t => t.name)); earned = new Set(names.filter(name => typeof name === 'string' && known.has(name)));
    save(); render();
  } catch { alert('Could not read that progress file.'); }
  event.target.value = '';
});
document.querySelectorAll('button[data-view]').forEach(() => {});
async function start() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load trophy data.');
  const data = await response.json();
  trophies = data.records.map(record => Object.fromEntries(data.columns.map((key, i) => [key, record[i]])));
  const requested = new URLSearchParams(location.search).get('grade');
  if (grades.includes(requested)) byId('grade').value = requested;
  renderRoadmap(); render();
  const scroll = Number(new URLSearchParams(location.search).get('scroll'));
  if (Number.isFinite(scroll) && scroll > 0) requestAnimationFrame(() => window.scrollTo(0, scroll));
}
start().catch(error => { byId('cards').textContent = error.message; });
