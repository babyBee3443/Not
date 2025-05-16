
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
    // Basic filter for non-translatable words or already processed
    if (!wordToTranslate.trim() || translatedWord || isLoading || error) return;
    
    // Avoid translating very short words or numbers-only words, adjust as needed
    if (wordToTranslate.length <= 1 && !wordToTranslate.match(/[a-zA-Z]/) ) {
        setTranslatedWord(wordToTranslate); // Show original if not translatable
        return;
    }
    if (/^\d+$/.test(wordToTranslate)) {
        setTranslatedWord(wordToTranslate); // Show original if just numbers
        return;
    }


    setIsLoading(true);
    setError(null);
    try {
      const result = await translateEnglishWordToTurkish({ englishWord: wordToTranslate });
      setTranslatedWord(result.turkishWord);
    } catch (err) {
      console.warn(`Kelime çevirme hatası (${wordToTranslate}):`, err);
      setError("Çeviri hatası");
      setTranslatedWord(null); // Clear previous translation on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip open={isTooltipOpen} onOpenChange={(open) => {
        setIsTooltipOpen(open);
        if (open && !translatedWord && !isLoading && !error) {
          fetchTranslation(word);
        }
      }}>
        <TooltipTrigger asChild>
          <span className={cn("cursor-default hover:bg-accent/70 p-[1px] m-[-1px] rounded-sm transition-colors duration-150", className)}>
            {word}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs shadow-lg">
          {isLoading && <span className="text-xs">Çevriliyor...</span>}
          {!isLoading && translatedWord && <span className="text-sm font-medium">{translatedWord}</span>}
          {!isLoading && error && <span className="text-xs text-destructive">{error}</span>}
          {!isLoading && !translatedWord && !error && <span className="text-xs">Çeviri için hazırlanıyor...</span>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
