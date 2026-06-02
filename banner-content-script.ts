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

function createChips(techniques: { name: string; keywords: string[] }[]): HTMLElement {
  removeBanner();
  const chipsContainer = document.createElement('div');
  chipsContainer.id = 'keyword-chips-container';
  chipsContainer.className = 'chips-container';

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

function removeBanner() {
  if (bannerElement && bannerElement.parentNode) {
    bannerElement.parentNode.removeChild(bannerElement);
    bannerElement = null;
    isBannerVisible = false;
  }
}

function showBanner(techniques: { name: string; keywords: string[] }[]) {
  const chips = createChips(techniques);
  document.body.appendChild(chips);
  isBannerVisible = true;
}

browser.runtime.onMessage.addListener((message: { action: string; techniques: { name: string; keywords: string[] }[] }, _sender: browser.runtime.MessageSender, sendResponse: (response: { success: boolean }) => void) => {
  if (message.action === 'showBanner') {
    showBanner(message.techniques);
  } else if (message.action === 'hideBanner') {
    removeBanner();
  }
  sendResponse({ success: true });
  return true;
});
