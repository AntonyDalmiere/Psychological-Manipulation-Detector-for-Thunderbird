declare module 'nlp-js-tools-french' {
  export interface StemResult {
    id: number;
    word: string;
    stem: string;
  }

  class NlpjsTFr {
    constructor(sentence: string, userConfig?: any);
    stemmer(): StemResult[];
    wordStemmer(word: string): { word: string; stem: string };
  }

  export default NlpjsTFr;
}
