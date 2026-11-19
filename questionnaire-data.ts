import type { TechniqueId } from './technique-id.js';

export type Dimension = TechniqueId;

export interface Question {
  id: number;
  dimension: Dimension;
  /** i18n key for the question text, e.g. "q1Text". */
  textKey: string;
  /** i18n keys for the four answers, in display order. */
  answerKeys: [string, string, string, string];
}

/**
 * The questionnaire is defined by keys only; the wording lives in
 * `_locales/<locale>/messages.json` so it can be translated.
 */
export const QUESTIONS: Question[] = [
  { id: 1, dimension: 'amorcage', textKey: 'q1Text', answerKeys: ['q1AnswerA', 'q1AnswerB', 'q1AnswerC', 'q1AnswerD'] },
  { id: 2, dimension: 'amorcage', textKey: 'q2Text', answerKeys: ['q2AnswerA', 'q2AnswerB', 'q2AnswerC', 'q2AnswerD'] },
  { id: 3, dimension: 'amorcage', textKey: 'q3Text', answerKeys: ['q3AnswerA', 'q3AnswerB', 'q3AnswerC', 'q3AnswerD'] },
  { id: 4, dimension: 'amorcage', textKey: 'q4Text', answerKeys: ['q4AnswerA', 'q4AnswerB', 'q4AnswerC', 'q4AnswerD'] },
  { id: 5, dimension: 'peur', textKey: 'q5Text', answerKeys: ['q5AnswerA', 'q5AnswerB', 'q5AnswerC', 'q5AnswerD'] },
  { id: 6, dimension: 'peur', textKey: 'q6Text', answerKeys: ['q6AnswerA', 'q6AnswerB', 'q6AnswerC', 'q6AnswerD'] },
  { id: 7, dimension: 'peur', textKey: 'q7Text', answerKeys: ['q7AnswerA', 'q7AnswerB', 'q7AnswerC', 'q7AnswerD'] },
  { id: 8, dimension: 'peur', textKey: 'q8Text', answerKeys: ['q8AnswerA', 'q8AnswerB', 'q8AnswerC', 'q8AnswerD'] },
  { id: 9, dimension: 'personnalisation', textKey: 'q9Text', answerKeys: ['q9AnswerA', 'q9AnswerB', 'q9AnswerC', 'q9AnswerD'] },
  { id: 10, dimension: 'personnalisation', textKey: 'q10Text', answerKeys: ['q10AnswerA', 'q10AnswerB', 'q10AnswerC', 'q10AnswerD'] },
  { id: 11, dimension: 'personnalisation', textKey: 'q11Text', answerKeys: ['q11AnswerA', 'q11AnswerB', 'q11AnswerC', 'q11AnswerD'] },
  { id: 12, dimension: 'personnalisation', textKey: 'q12Text', answerKeys: ['q12AnswerA', 'q12AnswerB', 'q12AnswerC', 'q12AnswerD'] },
  { id: 13, dimension: 'autorite', textKey: 'q13Text', answerKeys: ['q13AnswerA', 'q13AnswerB', 'q13AnswerC', 'q13AnswerD'] },
  { id: 14, dimension: 'autorite', textKey: 'q14Text', answerKeys: ['q14AnswerA', 'q14AnswerB', 'q14AnswerC', 'q14AnswerD'] },
  { id: 15, dimension: 'autorite', textKey: 'q15Text', answerKeys: ['q15AnswerA', 'q15AnswerB', 'q15AnswerC', 'q15AnswerD'] },
  { id: 16, dimension: 'autorite', textKey: 'q16Text', answerKeys: ['q16AnswerA', 'q16AnswerB', 'q16AnswerC', 'q16AnswerD'] },
  { id: 17, dimension: 'tentation', textKey: 'q17Text', answerKeys: ['q17AnswerA', 'q17AnswerB', 'q17AnswerC', 'q17AnswerD'] },
  { id: 18, dimension: 'tentation', textKey: 'q18Text', answerKeys: ['q18AnswerA', 'q18AnswerB', 'q18AnswerC', 'q18AnswerD'] },
  { id: 19, dimension: 'tentation', textKey: 'q19Text', answerKeys: ['q19AnswerA', 'q19AnswerB', 'q19AnswerC', 'q19AnswerD'] },
  { id: 20, dimension: 'tentation', textKey: 'q20Text', answerKeys: ['q20AnswerA', 'q20AnswerB', 'q20AnswerC', 'q20AnswerD'] },
];
