"use client";

import * as React from 'react';
import type { AIResults } from '@/lib/types';
import { ResultItem } from './result-item';

interface ResultsDisplayProps {
  results?: AIResults;
  isLoading: boolean;
  turkishInput?: string;
}

export function ResultsDisplay({ results, isLoading, turkishInput }: ResultsDisplayProps) {
  // Full block skeletons for initial load (isLoading is true AND no previous results exist)
  if (isLoading && !results) {
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

  // If not loading and no results are available (e.g., initial state before any submission)
  if (!isLoading && !results) {
    return null; // Or a placeholder message like "Enter a term or sentence above to see results."
  }
  
  // If results are available (even if isLoading is true for a refresh, individual ResultItems will handle their pulse)
  // Animate the container when new results are displayed.
  // The `key` prop ensures that when `turkishInput` changes, this component/div is treated as "new"
  // by React, allowing the animation classes to re-apply.
  return (
    <div 
      className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-10 duration-500 ease-out"
      key={turkishInput || 'initial-results-display'} 
    >
      <h2 className="text-2xl font-bold text-primary mb-4">Results</h2>
      
      {turkishInput && (
        <ResultItem 
          title="Original Input (Turkish)" 
          content={turkishInput} 
          isLoading={isLoading && (!results || !results.englishTerm)} // Show skeleton if overall loading and specific dependent data not ready
        />
      )}
      
      <ResultItem 
        title="English Term" 
        content={results?.englishTerm} 
        isLoading={isLoading && (!results || !results.englishTerm)} 
        isTerm={true} 
      />
      <ResultItem 
        title="Full English Translation" 
        content={results?.englishSentence} 
        isLoading={isLoading && (!results || !results.englishSentence)} 
      />
      <ResultItem 
        title="Definition" 
        content={results?.definition} 
        isLoading={isLoading && (!results || !results.definition)} 
      />
      <ResultItem 
        title="Explanation" 
        content={results?.explanation} 
        isLoading={isLoading && (!results || !results.explanation)} 
      />
    </div>
  );
}
