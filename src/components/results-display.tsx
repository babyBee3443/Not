
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

  if (!isLoading && !results) {
    return null; 
  }
  
  return (
    <div 
      className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-10 scale-in-95 duration-500 ease-out"
      key={turkishInput || 'initial-results-display'} 
    >
      <h2 className="text-2xl font-bold text-primary mb-4">Results</h2>
      
      {turkishInput && (
        <ResultItem 
          title="Original Input (Turkish)" 
          content={turkishInput} 
          isLoading={isLoading && (!results || !results.englishTerm)} 
        />
      )}
      
      <ResultItem 
        title="English Term" 
        content={results?.englishTerm} 
        isLoading={isLoading && (!results || !results.englishTerm)} 
        isTerm={true} 
        turkishEquivalent={results?.englishTerm ? turkishInput : undefined}
      />
      <ResultItem 
        title="Full English Translation" 
        content={results?.englishSentence} 
        isLoading={isLoading && (!results || !results.englishSentence)} 
        turkishEquivalent={results?.englishSentence ? turkishInput : undefined}
      />
      <ResultItem 
        title="Definition" 
        content={results?.definition} 
        isLoading={isLoading && (!results || !results.definition)} 
        turkishEquivalent={results?.definition ? turkishInput : undefined}
      />
      <ResultItem 
        title="Explanation" 
        content={results?.explanation} 
        isLoading={isLoading && (!results || !results.explanation)} 
        turkishEquivalent={results?.explanation ? turkishInput : undefined}
      />
    </div>
  );
}
