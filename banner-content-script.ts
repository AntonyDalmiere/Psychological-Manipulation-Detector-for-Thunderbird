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

/**
 * Create the technique chips display
 */
function createChips(techniques: { name: string; keywords: string[] }[]): HTMLElement {
  // Remove existing banner if present
  removeBanner();
  
  // Create chips container (floating overlay)
  const chipsContainer = document.createElement('div');
  chipsContainer.id = 'keyword-chips-container';
  chipsContainer.className = 'chips-container';
  
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
function showBanner(techniques: { name: string; keywords: string[] }[]) {
  const chips = createChips(techniques);
  document.body.appendChild(chips);
  isBannerVisible = true;
}

/**
 * Listen for messages from background script
 */
browser.runtime.onMessage.addListener((message: { action: string; techniques: { name: string; keywords: string[] }[] }, _sender: browser.runtime.MessageSender, sendResponse: (response: { success: boolean }) => void) => {

  if (message.action === 'showBanner') {
    showBanner(message.techniques);
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
