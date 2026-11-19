const SAVE_SLOT = 'leonida-field-guide-progress-v1';
const gradeSequence = ['platinum', 'gold', 'silver', 'bronze'];
const roadmapStages = [
  { number: 1, title: 'Build the story foundation', note: 'Clear the listed early chapters and mission beats in the sequence the list presents.' },
  { number: 2, title: 'Finish story strands', note: 'Complete the named character strands and chapter objectives as they become available.' },
  { number: 3, title: 'Close the main story', note: 'The final mission trophy sits after the earlier story milestones.' },
  { number: 4, title: 'Sweep collections and exploration', note: 'Use collection and discovery tracking for state-wide requirements.' },
  { number: 5, title: 'Finish activities and open-world goals', note: 'Work through repeatable challenges, races, robberies, and other listed activities.' },
  { number: 6, title: 'Claim the platinum', note: 'Earn the remaining trophies; this is the final reward in the list.' }
];
const columnIndex = Object.fromEntries(['id', 'name', 'description', 'grade', 'guide', 'kind', 'missable', 'stage', 'sources'].map((key, index) => [key, index]));
const pick = (record, key) => record[columnIndex[key]];
const nameOf = record => pick(record, 'name');

function restoreEarned() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_SLOT) || '[]');
    return new Set(Array.isArray(saved) ? saved.filter(value => typeof value === 'string') : []);
  } catch {
    return new Set();
  }
}

let records = [];
let earnedNames = restoreEarned();
const cardArea = document.getElementById('cards');
const gradeChoice = document.getElementById('grade');
const kindChoice = document.getElementById('kind');
const queryBox = document.getElementById('search');
const spoilerBox = document.getElementById('spoilers');
const earnVisibleButton = document.getElementById('earn-visible');
const clearVisibleButton = document.getElementById('clear-visible');

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function persist() {
  localStorage.setItem(SAVE_SLOT, JSON.stringify([...earnedNames]));
}

function drawTotals() {
  const earnedCount = records.filter(record => earnedNames.has(nameOf(record))).length;
  const completion = records.length ? Math.round(earnedCount * 100 / records.length) : 0;
  document.getElementById('progress').textContent = `${earnedCount} / ${records.length}`;
  document.getElementById('percent').textContent = `${completion}% complete`;
  document.getElementById('progress-bar').style.width = `${completion}%`;

  const summary = document.getElementById('grade-summary');
  summary.replaceChildren();
  for (const grade of gradeSequence) {
    const matching = records.filter(record => pick(record, 'grade') === grade);
    const completed = matching.filter(record => earnedNames.has(nameOf(record))).length;
    const tile = node('div', 'grade-stat');
    tile.append(node('span', '', grade), node('strong', '', `${completed} / ${matching.length}`));
    summary.append(tile);
  }
}

function trophyPresentation(record) {
  const hideDetails = spoilerBox.checked && !earnedNames.has(nameOf(record)) && (pick(record, 'kind') === 'story' || pick(record, 'hidden') === true);
  return hideDetails
    ? { title: 'Story spoiler', detail: 'Earn this trophy to reveal its details.', masked: true }
    : { title: nameOf(record), detail: pick(record, 'description'), masked: false };
}

function buildTrophyCard(record) {
  const title = nameOf(record);
  const isEarned = earnedNames.has(title);
  const article = node('article', `trophy-card${isEarned ? ' earned' : ''}`);
  const checkbox = node('input', 'check');
  checkbox.type = 'checkbox';
  checkbox.checked = isEarned;
  checkbox.setAttribute('aria-label', `Mark ${title} earned`);
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) earnedNames.add(title);
    else earnedNames.delete(title);
    persist();
    paint();
  });

  const body = node('div', 'card-content');
  const shown = trophyPresentation(record);
  const heading = node('div', 'card-title-row');
  heading.append(node('h3', 'card-title', shown.title), node('span', `grade-tag ${pick(record, 'grade')}`, pick(record, 'grade')));
  body.append(heading, node('p', 'description', shown.detail));
  if (!shown.masked) {
    body.append(node('p', 'guide', pick(record, 'guide')));
    body.append(node('small', 'citation', `SOURCE · ${pick(record, 'sources')}`));
  }

  const metadata = node('div', 'card-meta');
  metadata.append(node('span', 'kind-tag', pick(record, 'kind')));
  article.append(checkbox, body, metadata);
  if (pick(record, 'missable')) article.append(node('div', 'missable-flag', '⚠ Mission-linked · check before advancing past named content'));
  return article;
}

function matchesFilters(record, phrase) {
  const gradePass = gradeChoice.value === 'all' || pick(record, 'grade') === gradeChoice.value;
  const kindPass = kindChoice.value === 'all' || pick(record, 'kind') === kindChoice.value || (kindChoice.value === 'missable' && pick(record, 'missable'));
  return gradePass && kindPass && nameOf(record).toLocaleLowerCase().includes(phrase);
}

function visibleRecords() {
  const phrase = queryBox.value.trim().toLocaleLowerCase();
  return records.filter(record => matchesFilters(record, phrase));
}

function setVisibleEarned(earned) {
  for (const record of visibleRecords()) {
    const title = nameOf(record);
    if (earned) earnedNames.add(title);
    else earnedNames.delete(title);
  }
  persist();
  paint();
}

function drawCards() {
  cardArea.replaceChildren();
  const shown = visibleRecords();
  document.getElementById('result-count').textContent = `${shown.length} ${shown.length === 1 ? 'trophy' : 'trophies'} shown`;
  if (shown.length === 0) {
    cardArea.append(node('div', 'empty-state', 'No trophies match those filters. Try another grade, kind, or search.'));
    return;
  }
  for (const record of shown) cardArea.append(buildTrophyCard(record));
}

function drawRoadmap() {
  const roadmap = document.getElementById('roadmap');
  roadmap.replaceChildren();
  for (const stage of roadmapStages) {
    const panel = node('section', 'stage');
    panel.append(node('span', 'stage-number', String(stage.number)), node('h3', '', stage.title), node('p', 'stage-note', stage.note));
    const entries = records.filter(record => pick(record, 'stage') === stage.number);
    const list = node('div', 'road-items');
    if (entries.length === 0) list.append(node('p', 'road-empty', 'No listed trophies in this stage.'));
    for (const record of entries) {
      const line = node('div', `road-item${pick(record, 'missable') ? ' warning' : ''}`);
      line.append(node('span', '', nameOf(record)), node('small', '', pick(record, 'missable') ? '⚠ mission-linked' : pick(record, 'grade')));
      list.append(line);
    }
    panel.append(list);
    roadmap.append(panel);
  }
}

function paint() {
  drawTotals();
  drawCards();
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(button => button.classList.toggle('active', button === tab));
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `${tab.dataset.view}-view`));
}));
[gradeChoice, kindChoice, spoilerBox].forEach(control => control.addEventListener('change', paint));
queryBox.addEventListener('input', drawCards);
earnVisibleButton.addEventListener('click', () => setVisibleEarned(true));
clearVisibleButton.addEventListener('click', () => setVisibleEarned(false));

document.getElementById('export').addEventListener('click', () => {
  const exportData = { format: 'leonida-field-guide-progress-v1', earned: [...earnedNames] };
  const fileUrl = URL.createObjectURL(new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }));
  const download = document.createElement('a');
  download.href = fileUrl;
  download.download = 'leonida-trophy-progress.json';
  download.click();
  URL.revokeObjectURL(fileUrl);
});

document.getElementById('import').addEventListener('change', async event => {
  const chosenFile = event.target.files?.[0];
  if (!chosenFile) return;
  try {
    const imported = JSON.parse(await chosenFile.text());
    const names = Array.isArray(imported) ? imported : imported.earned;
    if (!Array.isArray(names)) throw new Error('No earned trophy names were found.');
    const validNames = new Set(records.map(nameOf));
    earnedNames = new Set(names.filter(name => typeof name === 'string' && validNames.has(name)));
    persist();
    paint();
  } catch {
    alert('That progress file could not be read. Choose a JSON export from this guide.');
  }
  event.target.value = '';
});

async function launch() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  records = data.records;
  const options = new URLSearchParams(location.search);
  const requestedGrade = options.get('grade');
  if (gradeSequence.includes(requestedGrade)) gradeChoice.value = requestedGrade;
  drawRoadmap();
  paint();
  const offset = Number(options.get('scroll'));
  if (Number.isFinite(offset) && offset > 0) requestAnimationFrame(() => window.scrollTo(0, offset));
}

launch();
