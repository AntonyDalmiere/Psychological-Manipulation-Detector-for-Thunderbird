/**
 * Stable identifiers for the five APPÂT manipulation techniques.
 *
 * These ids are used as storage keys, CSS class suffixes and i18n key
 * fragments, so they must never be localized or renamed.
 */
export type TechniqueId = 'autorite' | 'peur' | 'personnalisation' | 'amorcage' | 'tentation';

export const TECHNIQUE_IDS: readonly TechniqueId[] = [
  'amorcage',
  'peur',
  'personnalisation',
  'autorite',
  'tentation',
];
