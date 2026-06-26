import { QUESTIONS, Question, Dimension } from './questionnaire-data.js';

const ANSWER_SCORES = [3, 2, 1, 0]; // A=3 (most vulnerable), D=0
const DIM_LABELS: Record<Dimension, string> = { amorcage: 'Amorçage', peur: 'Peur', personnalisation: 'Personnalisation', autorite: 'Autorité', tentation: 'Tentation' };
const DIM_COLORS: Record<Dimension, string> = { amorcage: '#ef9f27', peur: '#501313', personnalisation: '#185fa5', autorite: '#e24b4a', tentation: '#d4537e' };

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
  if (score >= 9) return 'Très vulnérable';
  if (score >= 4) return 'Modérément vulnérable';
  return 'Peu vulnérable';
}

function scoreToPercent(score: number): number { return Math.round((score / 12) * 100); }

// State
let questions: Question[] = [];
let current = 0;
let selected: number | null = null;
const dimScores: Record<Dimension, number> = { amorcage: 0, peur: 0, personnalisation: 0, autorite: 0, tentation: 0 };

function showScreen(id: string) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id)!.classList.add('active');
}

function renderQuestion() {
  const q = questions[current];
  selected = null;
  (document.getElementById('btn-next') as HTMLButtonElement).disabled = true;
  const pct = Math.round((current / questions.length) * 100);
  (document.getElementById('progress-fill') as HTMLElement).style.width = `${pct}%`;
  document.getElementById('progress-label')!.textContent = `Question ${current + 1} / ${questions.length}`;
  document.getElementById('question-text')!.textContent = q.text;
  const container = document.getElementById('answers-container')!;
  container.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  q.answers.forEach((answer, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="answer-label">${labels[i]}.</span>${answer}`;
    btn.onclick = () => {
      container.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selected = i;
      (document.getElementById('btn-next') as HTMLButtonElement).disabled = false;
    };
    container.appendChild(btn);
  });
}

function nextQuestion() {
  if (selected === null) return;
  dimScores[questions[current].dimension] += ANSWER_SCORES[selected];
  current++;
  if (current < questions.length) { renderQuestion(); return; }
  saveAndShowResult();
}

async function saveAndShowResult() {
  const weights: Record<string, number> = {};
  const dims: Dimension[] = ['amorcage', 'peur', 'personnalisation', 'autorite', 'tentation'];
  dims.forEach(d => { weights[d] = scoreToWeight(dimScores[d]); });
  await browser.storage.local.set({ techniqueWeights: weights });

  const grid = document.getElementById('result-grid')!;
  grid.innerHTML = '';
  dims.forEach(d => {
    const pct = scoreToPercent(dimScores[d]);
    const div = document.createElement('div'); div.className = 'result-dim';
    div.innerHTML = `<div class="result-dim-name">${DIM_LABELS[d]}</div><div class="result-dim-bar-wrap"><div class="result-dim-bar" style="width:${pct}%;background:${DIM_COLORS[d]}"></div></div><div class="result-dim-label">${scoreToLabel(dimScores[d])}</div>`;
    grid.appendChild(div);
  });
  showScreen('screen-result');
}

async function skipToMax() {
  const weights: Record<string, number> = { amorcage: 2, peur: 2, personnalisation: 2, autorite: 2, tentation: 2 };
  await browser.storage.local.set({ techniqueWeights: weights });
  showScreen('screen-result');
  document.getElementById('result-grid')!.innerHTML = '';
}

function startQuestionnaire() {
  questions = shuffle(QUESTIONS);
  current = 0;
  const dims: Dimension[] = ['amorcage', 'peur', 'personnalisation', 'autorite', 'tentation'];
  dims.forEach(d => { dimScores[d] = 0; });
  showScreen('screen-question');
  renderQuestion();
}

document.getElementById('btn-start')!.addEventListener('click', startQuestionnaire);
document.getElementById('btn-skip')!.addEventListener('click', skipToMax);
document.getElementById('btn-next')!.addEventListener('click', nextQuestion);
document.getElementById('btn-redo')!.addEventListener('click', startQuestionnaire);
