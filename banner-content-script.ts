/**
 * Keyword Banner - Content Script for Message Viewer
 * 
 * This script runs in the context of the message viewer (email reading pane).
 * It listens for messages from the background script and creates/displays
 * the warning banner when keywords are detected.
 */

import type { TechniqueId } from './technique-id.js';

interface MatchedTechnique {
  id: TechniqueId;
  keywords: string[];
}

let bannerElement: HTMLElement | null = null;
let isBannerVisible: boolean = false;

/**
 * Look up a localized string, falling back to the key itself so a missing
 * translation is visible during development instead of rendering "undefined".
 */
function msg(key: string, substitutions?: string | string[]): string {
  const message = browser.i18n.getMessage(key, substitutions);
  return message || key;
}

/**
 * Map a technique id to a CSS class for category-specific colors.
 */
function getTechniqueClass(id: TechniqueId): string {
  return `technique-${id}`;
}

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

function calcManipScore(techniques: MatchedTechnique[], weights: Record<string, number>): number {
  const sum = techniques.reduce((acc, t) => {
    const w = getProfileMultiplier(weights[t.id] ?? 1);
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

function calculateScore(techniques: MatchedTechnique[], _totalKeywords: number, weights: Record<string, number>): number {
  const totalKw = techniques.reduce((acc, t) => acc + t.keywords.length, 0);
  return Math.max(calcManipScore(techniques, weights), calcPhishingScore(totalKw));
}

function getDangerLabel(score: number): string {
  if (score >= 75) return msg('dangerCritical');
  if (score >= 50) return msg('dangerHigh');
  if (score >= 25) return msg('dangerModerate');
  return msg('dangerLow');
}

function createModalHeader(onClose: () => void): HTMLElement {
  const h = document.createElement('div'); h.className = 'modal-header';
  const title = document.createElement('span'); title.className = 'modal-title'; title.textContent = msg('bannerTitle');
  const b = document.createElement('button'); b.className = 'modal-close'; b.textContent = '✕'; b.onclick = onClose;
  h.append(title, b); return h;
}

function createScoreRow(score: number): HTMLElement {
  const row = document.createElement('div'); row.className = 'score-row';
  const label = document.createElement('span'); label.className = 'score-label'; label.textContent = msg('scoreLabel');
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

function createChipNew(technique: MatchedTechnique): HTMLElement {
  const chip = document.createElement('div'); chip.className = `technique-chip ${getTechniqueClass(technique.id)}`;
  const name = document.createElement('span'); name.className = 'chip-text';
  name.textContent = msg(`technique${technique.id.charAt(0).toUpperCase()}${technique.id.slice(1)}`);
  chip.append(name); return chip;
}

function createProfileLink(): HTMLElement {
  const footer = document.createElement('div'); footer.className = 'modal-footer';
  const link = document.createElement('span'); link.className = 'profile-link'; link.textContent = msg('profileConfigure');
  link.onclick = () => browser.runtime.sendMessage({ action: 'openQuestionnaire' });
  browser.storage.local.get('techniqueWeights').then(s => { if ((s as any).techniqueWeights) link.textContent = msg('profileEdit'); });
  footer.appendChild(link); return footer;
}

function createChips(techniques: MatchedTechnique[], totalKeywords: number, weights: Record<string, number> = {}): HTMLElement {
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
  div.textContent = msg('safeNotification');
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
function showBanner(techniques: MatchedTechnique[], totalKeywords: number, weights: Record<string, number> = {}) {
  const chips = createChips(techniques, totalKeywords, weights);
  document.body.appendChild(chips);
  isBannerVisible = true;
}

/**
 * Listen for messages from background script
 */
browser.runtime.onMessage.addListener((message: { action: string; techniques: MatchedTechnique[]; totalKeywords: number; weights: Record<string, number> }, sender: browser.runtime.MessageSender, sendResponse: (response: { success: boolean }) => void) => {
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
