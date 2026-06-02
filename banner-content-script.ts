/**
 * Keyword Banner - Content Script for Message Viewer
 *
 * This script runs in the context of the message viewer (email reading pane).
 * It listens for messages from the background script and creates/displays
 * the warning banner when keywords are detected.
 */

let bannerElement: HTMLElement | null = null;
let isBannerVisible: boolean = false;

function getTechniqueClass(name: string): string {
  const normalized = name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  switch (normalized) {
    case 'autorite':        return 'technique-autorite';
    case 'peur':            return 'technique-peur';
    case 'personnalisation': return 'technique-personnalisation';
    case 'amorcage':        return 'technique-amorcage';
    case 'tentation':       return 'technique-tentation';
    default:                return 'technique-default';
  }
}

const TECHNIQUE_NAME_MAP: Record<string, string> = {
  'Autorité': 'autorite', 'Peur': 'peur', 'Personnalisation': 'personnalisation',
  'Amorçage': 'amorcage', 'Tentation': 'tentation',
};

function calculateScore(
  techniques: { name: string; keywords: string[] }[],
  totalKeywords: number,
  weights: Record<string, number>,
): number {
  const weighted = techniques.reduce((sum, t) => {
    const key = TECHNIQUE_NAME_MAP[t.name] ?? t.name.toLowerCase();
    return sum + t.keywords.length * (weights[key] ?? 1);
  }, 0);
  return Math.min(100, Math.round((weighted / totalKeywords) * 100));
}

function getDangerLabel(score: number): string {
  if (score >= 76) return 'critique';
  if (score >= 51) return 'eleve';
  if (score >= 21) return 'modere';
  return 'faible';
}

function createChips(techniques: { name: string; keywords: string[] }[], totalKeywords: number, weights: Record<string, number>): HTMLElement {
  removeBanner();
  const chipsContainer = document.createElement('div');
  chipsContainer.id = 'keyword-chips-container';
  chipsContainer.className = 'chips-container';

  const score = calculateScore(techniques, totalKeywords, weights);
  const danger = getDangerLabel(score);
  const badge = document.createElement('div');
  badge.className = `score-badge ${danger}`;
  badge.textContent = `${danger.charAt(0).toUpperCase() + danger.slice(1)} — ${score}%`;
  chipsContainer.appendChild(badge);

  techniques.forEach((technique) => {
    const chip = document.createElement('div');
    chip.className = `technique-chip ${getTechniqueClass(technique.name)}`;
    chip.title = `Matching keywords: ${technique.keywords.join(', ')}`;

    const chipText = document.createElement('span');
    chipText.className = 'chip-text';
    chipText.textContent = technique.name;
    chip.appendChild(chipText);

    const closeButton = document.createElement('button');
    closeButton.className = 'chip-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      chip.remove();
      if (chipsContainer.children.length === 0) removeBanner();
    });
    chip.appendChild(closeButton);

    chipsContainer.appendChild(chip);
  });

  bannerElement = chipsContainer;
  return chipsContainer;
}

function showSafeNotification() {
  const toast = document.createElement('div');
  toast.className = 'safe-notification';
  toast.textContent = '✓ Aucune manipulation détectée';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function removeBanner() {
  if (bannerElement && bannerElement.parentNode) {
    bannerElement.parentNode.removeChild(bannerElement);
    bannerElement = null;
    isBannerVisible = false;
  }
}

function showBanner(techniques: { name: string; keywords: string[] }[], totalKeywords: number, weights: Record<string, number>) {
  const chips = createChips(techniques, totalKeywords, weights);
  document.body.appendChild(chips);
  isBannerVisible = true;
}

browser.runtime.onMessage.addListener((message: { action: string; techniques: { name: string; keywords: string[] }[]; totalKeywords: number; weights: Record<string, number> }, _sender: browser.runtime.MessageSender, sendResponse: (response: { success: boolean }) => void) => {
  if (message.action === 'showBanner') {
    showBanner(message.techniques, message.totalKeywords, message.weights);
  } else if (message.action === 'showSafe') {
    showSafeNotification();
  } else if (message.action === 'hideBanner') {
    removeBanner();
  }
  sendResponse({ success: true });
  return true;
});
