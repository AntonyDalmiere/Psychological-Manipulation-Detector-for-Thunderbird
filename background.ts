/**
 * Keyword Banner - Background Script (Manifest V3)
 * 
 * This script runs as a service worker in the background and:
 * 1. Registers the content script for message viewer using scripting.messageDisplay API
 * 2. Listens for displayed messages with persistent listener
 * 3. Checks message content for trigger keywords
 * 4. Sends messages to content script to show banner if keywords found
 * 
 * IMPORTANT: All event listeners must be registered BEFORE the first await statement
 * to ensure they are registered as persistent listeners in Manifest V3.
 */

import { TECHNIQUE_KEYWORDS } from './keyword.js';
import NlpjsTFr from 'nlp-js-tools-french';

/**
 * Lemmatize text by tokenizing and returning lemmatized forms of each token
 * @param text - The raw text to lemmatize
 * @returns Array of lemmatized tokens (lowercase)
 */
function lemmatizeText(text: string): string[] {
  if (!text) return [];
  
  try {
    // Create NLP instance with the text and get lemmatized results
    const nlp = new NlpjsTFr(text);
    const lemmatized = nlp.lemmatizer();
    
    // Extract unique lemmas from the analysis result
    // lemmatized is an array of {word, lemma, id} objects
    const lemmaSet = new Set<string>();
    for (const token of lemmatized) {
      const lemma = (token as any).lemma || (token as any).word || '';
      if (lemma.length > 0) {
        lemmaSet.add(lemma.toLowerCase());
      }
    }
    
    return Array.from(lemmaSet);
  } catch (error) {
    console.warn('[LEMMATIZE] Error lemmatizing text:', error);
    // Fallback to simple tokenization if lemmatizer fails
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(token => token.length > 0);
  }
}



/**
 * Recursively extract text from message parts
 */
function extractTextFromParts(parts: any[]): string {
  if (!parts) return '';
  return parts
    .map(part => {
      if (part.body) return part.body;
      if (part.parts) return extractTextFromParts(part.parts);
    })
    .join('\n');
}

/**
 * Check a message for keywords and send banner instruction to content script
 */
async function checkMessageAndShowBanner(tab: browser.tabs.Tab, message: any) {
  try {
    const messageDetails: any = await (browser as any).messages.getFull(message.id);
    console.log(messageDetails);
    const subject = message.subject || '';
    const nestedText = extractTextFromParts(messageDetails.parts);
    const bodyText = (messageDetails.body || '') + nestedText;
    
    const fullText = `${subject}\n${bodyText}`;
    console.log('[SCAN] Scanning message:', message.id, 'with text:', fullText);
    
    // Lemmatize the incoming text to get array of lemmatized tokens
    const lemmatizedTokens = lemmatizeText(fullText);
    console.log('[SCAN] Lemmatized text:', lemmatizedTokens);
    const matchedTechniques: { name: string; keywords: string[] }[] = [];

    // For each technique, check if any of its keywords match lemmatized tokens
    for (const technique of TECHNIQUE_KEYWORDS) {
      const matchedKeywords: string[] = [];
      
      for (const keyword of technique.keywords) {
        // Check if any lemmatized token matches the keyword (case-insensitive)
        const keywordLower = keyword.toLowerCase();
        if (lemmatizedTokens.includes(keywordLower)) {
          matchedKeywords.push(keyword);
        }
      }
      
      if (matchedKeywords.length > 0) {
        matchedTechniques.push({
          name: technique.name,
          keywords: matchedKeywords
        });
      }
    }

    if (matchedTechniques.length > 0) {
      await browser.tabs.sendMessage(tab.id!, {
        action: 'showBanner',
        techniques: matchedTechniques,
        subject: subject
      });
    }
  } catch (error) {
  }
}

/**
 * Handle displayed messages - this is the main event handler
 * Must be defined as a separate function to allow listener registration before await
 */
async function handleMessagesDisplayed(tab: browser.tabs.Tab, messageList: { messages: any[] }) {
  const { messages } = messageList;
  
  for (let i = 0; i < messages.length; i++) {
    await checkMessageAndShowBanner(tab, messages[i]);
  }
}

// Register the message display listener FIRST (before any await) to ensure it's persistent
(browser as any).messageDisplay.onMessagesDisplayed.addListener(handleMessagesDisplayed);

// Register the content script using the MV3 scripting.messageDisplay API
// This must be done at the top level, and we catch errors for re-registration
async function registerContentScript() {
  try {
    await (browser as any).scripting.messageDisplay.registerScripts([{
      id: 'keyword-banner-script',
      css: ['banner.css'],
      js: ['banner-content-script.js'],
      runAt: 'document_start',
    }]);
  } catch (error) {
  }
}

registerContentScript();
