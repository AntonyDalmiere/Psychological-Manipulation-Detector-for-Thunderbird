declare module 'nlp-js-tools-french' {
  export interface TokenResult {
    id: number;
    word: string;
    lemma: string;
  }

  class NlpjsTFr {
    constructor(sentence: string, userConfig?: any);
    lemmatizer(): TokenResult[];
    posTagger(): any[];
    stemmer(): any[];
  }

  export default NlpjsTFr;
}
