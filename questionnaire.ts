import { QUESTIONS, Question, Dimension } from './questionnaire-data.js';
import { TECHNIQUE_IDS } from './technique-id.js';

const ANSWER_SCORES = [3, 2, 1, 0]; // A=3 (most vulnerable), D=0
const DIM_COLORS: Record<Dimension, string> = { amorcage: '#ef9f27', peur: '#501313', personnalisation: '#185fa5', autorite: '#e24b4a', tentation: '#d4537e' };

/**
 * Look up a localized string, falling back to the key itself so a missing
 * translation is visible during development instead of rendering "undefined".
 */
function msg(key: string, substitutions?: string | string[]): string {
  const message = browser.i18n.getMessage(key, substitutions);
  return message || key;
}

function dimLabelKey(dim: Dimension): string {
  return `dim${dim.charAt(0).toUpperCase()}${dim.slice(1)}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function scoreToWeight(score: number): number {
  if (score >= 9) return 2;
  if (score >= 4) return 1.5;
  return 1;
}

function scoreToLabel(score: number): string {
  if (score >= 9) return msg('vulnHigh');
  if (score >= 4) return msg('vulnModerate');
  return msg('vulnLow');
}

function scoreToPercent(score: number): number { return Math.round((score / 12) * 100); }

function createCard(q: Question): HTMLElement {
  const card = document.createElement('div'); card.className = 'flashcard';
  const text = document.createElement('div'); text.className = 'question-text'; text.textContent = msg(q.textKey);
  const wrap = document.createElement('div');
  ['A','B','C','D'].forEach((l, i) => {
    const btn = document.createElement('button'); btn.className = 'answer-btn';
    const label = document.createElement('span'); label.className = 'answer-label'; label.textContent = `${l}.`;
    btn.append(label, document.createTextNode(msg(q.answerKeys[i])));
    btn.onclick = () => { wrap.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); selected = i; setTimeout(nextQuestion, 350); };
    wrap.appendChild(btn);
  });
  card.append(text, wrap); return card;
}

// State
let questions: Question[] = [];
let current = 0;
let selected: number | null = null;
const dimScores: Record<Dimension, number> = { amorcage: 0, peur: 0, personnalisation: 0, autorite: 0, tentation: 0 };

function showScreen(id: string) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id)!.classList.add('active');
}

function renderQuestion(animate = false) {
  const q = questions[current]; selected = null;
  (document.getElementById('progress-fill') as HTMLElement).style.width = `${Math.round((current / questions.length) * 100)}%`;
  document.getElementById('progress-label')!.textContent = msg('progressLabel', [String(current + 1), String(questions.length)]);
  const stage = document.getElementById('flashcard-stage')!;
  const card = createCard(q); if (animate) card.classList.add('slide-in');
  stage.replaceChildren(card);
}

function nextQuestion() {
  if (selected === null) return;
  dimScores[questions[current].dimension] += ANSWER_SCORES[selected];
  current++;
  if (current >= questions.length) { saveAndShowResult(); return; }
  const stage = document.getElementById('flashcard-stage')!;
  const old = stage.firstElementChild as HTMLElement; if (old) old.classList.add('slide-out');
  setTimeout(() => renderQuestion(true), 260);
}

function createResultDim(dim: Dimension): HTMLElement {
  const pct = scoreToPercent(dimScores[dim]);
  const div = document.createElement('div'); div.className = 'result-dim';

  const name = document.createElement('div'); name.className = 'result-dim-name'; name.textContent = msg(dimLabelKey(dim));

  const barWrap = document.createElement('div'); barWrap.className = 'result-dim-bar-wrap';
  const bar = document.createElement('div'); bar.className = 'result-dim-bar';
  bar.style.width = `${pct}%`; bar.style.background = DIM_COLORS[dim];
  barWrap.appendChild(bar);

  const label = document.createElement('div'); label.className = 'result-dim-label'; label.textContent = scoreToLabel(dimScores[dim]);

  div.append(name, barWrap, label);
  return div;
}

async function saveAndShowResult() {
  const weights: Record<string, number> = {};
  TECHNIQUE_IDS.forEach(d => { weights[d] = scoreToWeight(dimScores[d]); });
  await browser.storage.local.set({ techniqueWeights: weights });

  const grid = document.getElementById('result-grid')!;
  grid.replaceChildren(...TECHNIQUE_IDS.map(createResultDim));
  showScreen('screen-result');
}

async function skipToMax() {
  const weights: Record<string, number> = {};
  TECHNIQUE_IDS.forEach(d => { weights[d] = 2; });
  await browser.storage.local.set({ techniqueWeights: weights });
  showScreen('screen-result');
  document.getElementById('result-grid')!.replaceChildren();
}

function startQuestionnaire() {
  questions = shuffle(QUESTIONS);
  current = 0;
  TECHNIQUE_IDS.forEach(d => { dimScores[d] = 0; });
  showScreen('screen-question');
  renderQuestion();
}

/**
 * Replace every element carrying a `data-i18n` attribute with its localized
 * string. Keeps the markup free of hardcoded copy.
 */
function localizeStaticMarkup() {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    el.textContent = msg(el.dataset.i18n!);
  });
  document.documentElement.lang = browser.i18n.getUILanguage();
  document.title = msg('questionnaireTitle');
}

localizeStaticMarkup();

document.getElementById('btn-start')!.addEventListener('click', startQuestionnaire);
document.getElementById('btn-skip')!.addEventListener('click', skipToMax);
document.getElementById('btn-redo')!.addEventListener('click', startQuestionnaire);
