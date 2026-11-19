import NlpjsTFr from 'nlp-js-tools-french';
import type { TechniqueId } from './technique-id.js';

export interface TechniqueKeywords {
  id: TechniqueId;
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
    id: "autorite",
    keywords: stemKeywords(["capital", "cordialement", "remercier", "confiance", "fonctionnement", "mettre", "cher", "analyse", "société", "client", "centre", "sg", "diviser", "nominal", "inchangé", "anonyme", "assistance", "efficace", "fédération", "hsc", "euro", "prier", "coordonnée", "garantir", "possible", "compte", "social", "essentiel", "action", "jour"])
  },
  {
    id: "peur",
    keywords: stemKeywords(["confidentialité", "droit", "envoyer", "avis", "personnel", "politique", "traitement", "lire", "mail", "garantie", "loi", "avantage", "argent", "public", "traiter", "condition", "responsable", "utilisation", "accepter", "référence", "prendre", "com", "transaction", "comprendre", "année", "publicité", "donnée", "web", "total", "entrer", "fidélité", "simplement", "gagner", "gratuit", "image", "réclamer", "félicitation", "programme", "retirer", "récompense", "expirer", "sondage", "expired", "has", "offrir", "fantastique", "sélectionner", "participer", "tour", "gratuitement", "casino", "cadre", "membership", "bonus", "prolonger", "obtenir", "machine", "exclusif", "choisir", "abonnement"])
  },
  {
    id: "personnalisation",
    keywords: stemKeywords(["colis", "livraison", "suivre", "livrer", "reconfirmer", "confirmation", "présent", "signer", "part", "envoi", "adresse", "vérifier", "besoin", "illisible", "caractère", "attente", "recevoir", "e_mail", "prévoir", "ouvrable", "entrepôt", "gls", "écrire", "spécial", "poste", "commander", "inconnu", "planifier", "expéditeur", "fedex"])
  },
  {
    id: "amorcage",
    keywords: stemKeywords(["facturation", "expiration", "update", "produire", "échouer", "cycle", "évidemment", "lister", "revoir", "valider", "récent", "paiement", "abonnement", "hold", "renouveler", "mensuel", "payment", "suspendre", "date", "mercredi", "essayer", "annuler", "réessayer", "netflix", "issu", "filière", "associatif", "archivée", "claudelands", "syndical"])
  },
  {
    id: "tentation",
    keywords: stemKeywords(["femme", "soir", "photo", "voir", "désinscrire", "profil", "rencontrer", "aimer", "répondre", "amour", "discuter", "coeur", "aventure", "chatter", "sexy", "am", "chattez", "bombe", "flirter", "sortir", "désabonner", "rencontre", "évaluer", "ensemble", "invitation", "célibataire", "sexfinder", "meetup", "local", "flirtback"])
  }
];