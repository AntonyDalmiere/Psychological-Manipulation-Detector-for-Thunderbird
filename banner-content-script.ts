/**
 * Keyword Banner - Content Script for Message Viewer
 * 
 * This script runs in the context of the message viewer (email reading pane).
 * It listens for messages from the background script and creates/displays
 * the warning banner when keywords are detected.
 */

let bannerElement: HTMLElement | null = null;
let isBannerVisible: boolean = false;

/**
 * Map technique name to a CSS class for category-specific colors.
 */
function getTechniqueClass(name: string): string {
  const normalized = name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  switch (normalized) {
    case 'personnalisation':
      return 'technique-personnalisation';
    case 'tentation':
      return 'technique-tentation';
    case 'autorite':
      return 'technique-autorite';
    case 'peur':
      return 'technique-peur';
    case 'amorcage':
      return 'technique-amorcage';
    default:
      return 'technique-default';
  }
}

const TECHNIQUE_NAME_MAP: Record<string, string> = {
  'Autorité': 'autorite', 'Peur': 'peur', 'Personnalisation': 'personnalisation',
  'Amorçage': 'amorcage', 'Tentation': 'tentation',
};

function getProfileMultiplier(weight: number): number {
  if (weight >= 2) return 1.5;
  if (weight >= 1.5) return 1.25;
  return 1.0;
}

function getCooccurrenceBonus(count: number): number {
  if (count >= 4) return 30;
  if (count === 3) return 18;
  if (count === 2) return 8;
  return 0;
}

function calcManipScore(techniques: { name: string; keywords: string[] }[], weights: Record<string, number>): number {
  const sum = techniques.reduce((acc, t) => {
    const w = getProfileMultiplier(weights[TECHNIQUE_NAME_MAP[t.name] ?? t.name] ?? 1);
    return acc + Math.min(2, t.keywords.length) * 5 * w;
  }, 0);
  return Math.min(100, Math.round(sum + getCooccurrenceBonus(techniques.length)));
}

function calcPhishingScore(n: number): number {
  if (n === 0) return 0;
  return Math.min(100, 50 + (n - 1) * 10);
}

function scoreToColor(score: number): string {
  const hue = Math.round(120 - score * 1.2);
  return `hsl(${hue}, 80%, 45%)`;
}

function calculateScore(techniques: { name: string; keywords: string[] }[], _totalKeywords: number, weights: Record<string, number>): number {
  const totalKw = techniques.reduce((acc, t) => acc + t.keywords.length, 0);
  return Math.max(calcManipScore(techniques, weights), calcPhishingScore(totalKw));
}

function getDangerLabel(score: number): string {
  if (score >= 75) return 'Critique';
  if (score >= 50) return 'Élevé';
  if (score >= 25) return 'Modéré';
  return 'Faible';
}

function createModalHeader(onClose: () => void): HTMLElement {
  const h = document.createElement('div'); h.className = 'modal-header';
  const t = document.createElement('span'); t.className = 'modal-title'; t.textContent = '⚠ ANALYSE DE MANIPULATION';
  const b = document.createElement('button'); b.className = 'modal-close'; b.textContent = '✕'; b.onclick = onClose;
  h.append(t, b); return h;
}

function createScoreRow(score: number): HTMLElement {
  const row = document.createElement('div'); row.className = 'score-row';
  const label = document.createElement('span'); label.className = 'score-label'; label.textContent = 'SCORE DE DANGER';
  const val = document.createElement('span'); val.className = 'score-value';
  val.textContent = `${score}/100 — ${getDangerLabel(score)}`; val.style.color = scoreToColor(score);
  row.append(label, val); return row;
}

function createProgressBar(score: number): HTMLElement {
  const wrap = document.createElement('div'); wrap.className = 'progress-wrap';
  const bar = document.createElement('div'); bar.className = 'progress-bar';
  bar.style.width = `${score}%`; bar.style.background = scoreToColor(score);
  wrap.appendChild(bar); return wrap;
}

function createChipNew(technique: { name: string; keywords: string[] }): HTMLElement {
  const chip = document.createElement('div'); chip.className = `technique-chip ${getTechniqueClass(technique.name)}`;
  const name = document.createElement('span'); name.className = 'chip-text'; name.textContent = technique.name;
  chip.append(name); return chip;
}

function createProfileLink(): HTMLElement {
  const footer = document.createElement('div'); footer.className = 'modal-footer';
  const link = document.createElement('span'); link.className = 'profile-link'; link.textContent = '✱ Modifier mon profil';
  link.onclick = () => browser.runtime.openOptionsPage();
  footer.appendChild(link); return footer;
}

function createChips(techniques: { name: string; keywords: string[] }[], totalKeywords: number, weights: Record<string, number> = {}): HTMLElement {
  removeBanner();
  const score = calculateScore(techniques, totalKeywords, weights);
  const modal = document.createElement('div'); modal.id = 'keyword-chips-container'; modal.className = 'manipulation-modal';
  modal.append(createModalHeader(removeBanner), createScoreRow(score), createProgressBar(score));
  const wrap = document.createElement('div'); wrap.className = 'chips-wrap';
  techniques.forEach(t => wrap.appendChild(createChipNew(t)));
  modal.append(wrap, createProfileLink()); bannerElement = modal; return modal;
}

/**
 * Remove the banner from the DOM
 */
function showSafeNotification() {
  const div = document.createElement('div');
  div.className = 'safe-notification';
  div.textContent = '✓ Aucune manipulation détectée';
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function removeBanner() {
  if (bannerElement && bannerElement.parentNode) {
    bannerElement.parentNode.removeChild(bannerElement);
    bannerElement = null;
    isBannerVisible = false;
  }
}

/**
 * Show the banner at the top of the message viewer
 */
function showBanner(techniques: { name: string; keywords: string[] }[], totalKeywords: number, weights: Record<string, number> = {}) {
  const chips = createChips(techniques, totalKeywords, weights);
  document.body.appendChild(chips);
  isBannerVisible = true;
}

/**
 * Listen for messages from background script
 */
browser.runtime.onMessage.addListener((message: { action: string; techniques: { name: string; keywords: string[] }[]; totalKeywords: number; weights: Record<string, number> }, sender: browser.runtime.MessageSender, sendResponse: (response: { success: boolean }) => void) => {
  if (message.action === 'showBanner') {
    showBanner(message.techniques, message.totalKeywords, message.weights);
  } else if (message.action === 'showSafe') {
    showSafeNotification();
  } else if (message.action === 'hideBanner') {
    removeBanner();
  }
  
  // Send response
  sendResponse({ success: true });
  
  return true; // Keep message channel open for async response
});

// Also try to inject on page load (for already open messages)
window.addEventListener('load', () => {
  console.log('Keyword Banner content script loaded');
});
