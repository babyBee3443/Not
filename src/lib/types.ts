export type ExplanationMode = 'Beginner' | 'Advanced';

export interface AIResults {
  englishSentence?: string;
  englishTerm?: string;
  definition?: string;
  explanation?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  turkishInput: string;
  mode: ExplanationMode;
  results: AIResults;
}
