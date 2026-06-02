/**
 * Keyword Banner - Content Script for Message Viewer
 * 
 * This script runs in the context of the message viewer (email reading pane).
 * It listens for messages from the background script and creates/displays
 * the warning banner when keywords are detected.
 */

let bannerElement: HTMLElement | null = null;
let isBannerVisible: boolean = false;

const TECHNIQUE_NAME_MAP: Record<string, string> = {
  'Autorité': 'autorite', 'Peur': 'peur', 'Personnalisation': 'personnalisation',
  'Amorçage': 'amorcage', 'Tentation': 'tentation',
};

/**
 * Create the technique chips display
 */
function createChips(techniques: { name: string; keywords: string[] }[], subject: string): HTMLElement {
  // Remove existing banner if present
  removeBanner();
  
  // Create chips container (floating overlay)
  const chipsContainer = document.createElement('div');
  chipsContainer.id = 'keyword-chips-container';
  chipsContainer.className = 'chips-container';
  
  // Create a chip for each technique
  techniques.forEach((technique) => {
    const chip = document.createElement('div');
    chip.className = 'technique-chip warning';
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
function showBanner(techniques: { name: string; keywords: string[] }[], subject: string) {
  // Wait for message content to load
  setTimeout(() => {
    // Try to find the message content container
    let targetContainer = null;
    
    // Common selectors for Thunderbird message viewer
    const selectors = [
      '#message-content',
      '.msgContent',
      '[data-message-id]',
      '.thread-pane-message-body',
      'iframe[src*="message"]',
      '#messageview'
    ];
    
    for (const selector of selectors) {
      targetContainer = document.querySelector(selector);
      if (targetContainer) break;
    }
    
    // If no specific container found, use document body
    if (!targetContainer) {
      targetContainer = document.body;
    }
    
    // Create and inject chips
    const chips = createChips(techniques, subject);
    
    // Insert at the top of the container (floating overlay)
    if (targetContainer.firstChild) {
      targetContainer.insertBefore(chips, targetContainer.firstChild);
    } else {
      targetContainer.appendChild(chips);
    }
    
    isBannerVisible = true;
  }, 100); // Small delay to ensure DOM is ready
}

/**
 * Listen for messages from background script
 */
browser.runtime.onMessage.addListener((message: { action: string; techniques: { name: string; keywords: string[] }[]; subject: string }, sender: browser.runtime.MessageSender, sendResponse: (response: { success: boolean }) => void) => {
  
  if (message.action === 'showBanner') {
    showBanner(message.techniques, message.subject);
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
