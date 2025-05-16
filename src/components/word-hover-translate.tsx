
'use client';

import * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { translateEnglishWordToTurkish } from '@/ai/flows/translate-english-word-flow';
import { cn } from '@/lib/utils';

interface WordHoverTranslateProps {
  word: string;
  className?: string;
}

export function WordHoverTranslate({ word, className }: WordHoverTranslateProps) {
  const [translatedWord, setTranslatedWord] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTranslation = async (wordToTranslate: string) => {
    const trimmedWord = wordToTranslate.trim();

    if (!trimmedWord) {
      setTranslatedWord(wordToTranslate); 
      return;
    }
    
    if (trimmedWord.length <= 1 && !trimmedWord.match(/[a-zA-Z]/) ) {
        setTranslatedWord(trimmedWord);
        return;
    }
    if (/^\d+$/.test(trimmedWord)) { 
        setTranslatedWord(trimmedWord);
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await translateEnglishWordToTurkish({ englishWord: trimmedWord });
      setTranslatedWord(result.turkishWord);
    } catch (err) {
      console.warn(`Kelime çevirme hatası (${trimmedWord}):`, err);
      setError("Çeviri hatası");
      setTranslatedWord(null); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerInteraction = () => {
    // This will call onOpenChange because the `open` prop of Tooltip is bound to isTooltipOpen
    setIsTooltipOpen(prev => !prev); 
  };

  return (
    <TooltipProvider>
      <Tooltip 
        open={isTooltipOpen} 
        onOpenChange={(open) => {
          setIsTooltipOpen(open);
          // Fetch translation when the tooltip is programmatically opened or opened by hover/focus,
          // and we don't have a translation yet, and not currently loading.
          if (open && !translatedWord && !isLoading && !error) {
            fetchTranslation(word);
          }
        }}
      >
        <TooltipTrigger asChild>
          <span 
            className={cn(
              "hover:bg-accent/70 p-[1px] m-[-1px] rounded-sm transition-colors duration-150 outline-none", 
              className,
              isTooltipOpen ? "bg-accent/70" : "" // Optional: style when open
            )}
            tabIndex={0} 
            onClick={handleTriggerInteraction}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTriggerInteraction();
              }
            }}
            role="button" // Improves semantics for screen readers
            aria-expanded={isTooltipOpen}
            aria-label={`Çevir: ${word}`}
          >
            {word}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs shadow-lg">
          {isLoading && <span className="text-xs">Çevriliyor...</span>}
          {!isLoading && translatedWord && <span className="text-sm font-medium">{translatedWord}</span>}
          {!isLoading && error && <span className="text-xs text-destructive">{error}</span>}
          {/* Show "hazırlanıyor" only if no other state is active and tooltip is intending to open or is open */}
          {!isLoading && !translatedWord && !error && isTooltipOpen && <span className="text-xs">Çeviri için hazırlanıyor...</span>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
