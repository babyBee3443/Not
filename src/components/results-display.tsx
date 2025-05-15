"use client";

import type { AIResults } from '@/lib/types';
import { ResultItem } from './result-item';

interface ResultsDisplayProps {
  results?: AIResults;
  isLoading: boolean;
  turkishInput?: string;
}

export function ResultsDisplay({ results, isLoading, turkishInput }: ResultsDisplayProps) {
  if (isLoading && !results) {
    // Initial loading state for all cards
    return (
      <div className="space-y-6 mt-8">
        <h2 className="text-2xl font-bold text-primary mb-4">Results</h2>
        <ResultItem title="Original Input (Turkish)" isLoading={true} />
        <ResultItem title="English Term" isLoading={true} isTerm={true} />
        <ResultItem title="Full English Translation" isLoading={true} />
        <ResultItem title="Definition" isLoading={true} />
        <ResultItem title="Explanation" isLoading={true} />
      </div>
    );
  }

  if (!results && !isLoading) {
    return null; // Or a placeholder message like "Enter a term or sentence above to see results."
  }
  
  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-2xl font-bold text-primary mb-4">Results</h2>
      
      {turkishInput && (
        <ResultItem title="Original Input (Turkish)" content={turkishInput} isLoading={isLoading && !results?.englishTerm} />
      )}
      
      <ResultItem title="English Term" content={results?.englishTerm} isLoading={isLoading && !results?.englishTerm} isTerm={true} />
      <ResultItem title="Full English Translation" content={results?.englishSentence} isLoading={isLoading && !results?.englishSentence} />
      <ResultItem title="Definition" content={results?.definition} isLoading={isLoading && !results?.definition} />
      <ResultItem title="Explanation" content={results?.explanation} isLoading={isLoading && !results?.explanation} />
    </div>
  );
}
