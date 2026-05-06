import NlpjsTFr from 'nlp-js-tools-french';

export interface TechniqueKeywords {
  name: string;
  keywords: { original: string; stemmed: string }[];
}

/**
 * Stem a keyword using the built-in French stemmer
 * @param keyword - The keyword to stem
 * @returns Stemmed keyword
 */
function stemKeyword(keyword: string): string {
  try {
    const nlp = new NlpjsTFr(keyword);
    const stemmed = nlp.stemmer();
    if (stemmed.length > 0 && (stemmed[0] as any).stem) {
      return (stemmed[0] as any).stem.toLowerCase();
    }
    return keyword.toLowerCase();
  } catch (error) {
    return keyword.toLowerCase();
  }
}

/**
 * Stem all keywords in an array at runtime
 */
function stemKeywords(keywords: string[]): { original: string; stemmed: string }[] {
  return keywords.map(keyword => ({
    original: keyword,
    stemmed: keyword
      .split(' ')
      .map(word => stemKeyword(word))
      .join(' ')
  }));
}

export const TECHNIQUE_KEYWORDS: TechniqueKeywords[] = [
  {
    name: "Autorité",
    keywords: stemKeywords(["capital", "confiance", "société", "client", "centre", "assistance", "garantir", "anonyme", "sg", "bnp paribas"])
  },
  {
    name: "Peur",
    keywords: stemKeywords(["supprimer", "expirer", "suspendre", "échouer", "danger", "menace", "perte"])
  },
  {
    name: "Personnalisation",
    keywords: stemKeywords(["colis", "adresse", "suivi", "expéditeur", "fedex", "gls"])
  },
  {
    name: "Amorçage",
    keywords: stemKeywords(["abonnement", "facturation", "cycle", "renouveler", "paiement", "prime"])
  },
  {
    name: "Tentation",
    keywords: stemKeywords(["femme", "sexy", "rencontre", "amour", "flirter", "chatte", "aventure"])
  }
];