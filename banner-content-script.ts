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

function calculateScore(techniques: { name: string; keywords: string[] }[], totalKeywords: number, weights: Record<string, number>): number {
  const weighted = techniques.reduce((sum, t) => sum + t.keywords.length * (weights[TECHNIQUE_NAME_MAP[t.name] ?? t.name] ?? 1), 0);
  return Math.min(100, Math.round((weighted / totalKeywords) * 100));
}

function getDangerLabel(score: number): string {
  if (score >= 76) return 'critique';
  if (score >= 51) return 'eleve';
  if (score >= 21) return 'modere';
  return 'faible';
}

/**
 * Create the technique chips display
 */
function createChips(techniques: { name: string; keywords: string[] }[], totalKeywords: number, weights: Record<string, number> = {}): HTMLElement {
  // Remove existing banner if present
  removeBanner();
  
  // Create chips container (floating overlay)
  const chipsContainer = document.createElement('div');
  chipsContainer.id = 'keyword-chips-container';
  chipsContainer.className = 'chips-container';

  const score = calculateScore(techniques, totalKeywords, weights);
  const danger = getDangerLabel(score);
  const badge = document.createElement('div');
  badge.className = `score-badge ${danger}`;
  badge.textContent = `${danger.charAt(0).toUpperCase() + danger.slice(1)} — ${score}%`;
  chipsContainer.appendChild(badge);

  // Create a chip for each technique
  techniques.forEach((technique) => {
    const chip = document.createElement('div');
    chip.className = `technique-chip ${getTechniqueClass(technique.name)}`;
    chip.title = `Matching keywords: ${technique.keywords.join(', ')}`;
    
    // Chip text (technique name)
    const chipText = document.createElement('span');
    chipText.className = 'chip-text';
    chipText.textContent = technique.name;
    chip.appendChild(chipText);
    
    // Close button for individual chip
    const closeButton = document.createElement('button');
    closeButton.className = 'chip-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      chip.remove();
      // Hide container if no chips left
      if (chipsContainer.children.length === 0) {
        removeBanner();
      }
    });
    chip.appendChild(closeButton);
    
    chipsContainer.appendChild(chip);
  });
  
  bannerElement = chipsContainer;
  
  return chipsContainer;
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

function isHighlightableNode(node: Text): boolean {
  const el = node.parentElement;
  if (!el) return false;
  if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return false;
  return !el.closest('#keyword-chips-container, .safe-notification, .keyword-highlight');
}

function collectTextNodes(): Text[] {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => isHighlightableNode(node as Text) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
  });
  const nodes: Text[] = [];
  let n; while ((n = walker.nextNode())) nodes.push(n as Text);
  return nodes;
}

function buildKeywordRegex(keywords: string[]): RegExp {
  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(${escaped.join('|')})`, 'gi');
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
