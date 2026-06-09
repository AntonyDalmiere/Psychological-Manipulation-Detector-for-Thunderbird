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

/** Returns true if the text node is safe to highlight (not inside script, style, or UI elements). */
function isHighlightableNode(node: Text): boolean {
  const el = node.parentElement;
  if (!el) return false;
  if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return false;
  return !el.closest('#keyword-chips-container, .safe-notification, .keyword-highlight');
}

/** Walks the document body and returns all highlightable text nodes. */
function collectTextNodes(): Text[] {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => isHighlightableNode(node as Text) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
  });
  const nodes: Text[] = [];
  let n; while ((n = walker.nextNode())) nodes.push(n as Text);
  return nodes;
}

/** Wraps a matched word in a <mark> element with the keyword-highlight class. */
function createMarkElement(word: string): HTMLElement {
  const mark = document.createElement('mark');
  mark.className = 'keyword-highlight';
  mark.textContent = word;
  return mark;
}

/** Splits a text string into a DocumentFragment, wrapping each regex match in a mark element. */
function buildHighlightFragment(text: string, regex: RegExp): DocumentFragment {
  const frag = document.createDocumentFragment(); let i = 0, m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > i) frag.appendChild(document.createTextNode(text.slice(i, m.index)));
    frag.appendChild(createMarkElement(m[0])); i = m.index + m[0].length;
  }
  if (i < text.length) frag.appendChild(document.createTextNode(text.slice(i))); return frag;
}

/** Highlights all keyword occurrences in the email body by replacing text nodes in place. */
function highlightKeywords(keywords: string[]) {
  if (keywords.length === 0) return;
  const regex = buildKeywordRegex(keywords);
  collectTextNodes().forEach(node => {
    const text = node.textContent || '';
    if (!regex.test(text)) { regex.lastIndex = 0; return; }
    regex.lastIndex = 0; node.parentNode!.replaceChild(buildHighlightFragment(text, regex), node);
  });
}

/** Compiles a list of keywords into a single global case-insensitive regex. */
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
  highlightKeywords(techniques.reduce((acc: string[], t) => acc.concat(t.keywords), []));
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
