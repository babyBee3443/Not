
'use client';

import * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { translateEnglishWordToTurkish } from '@/ai/flows/translate-english-word-flow';
import { cn } from '@/lib/utils';

interface WordHoverTranslateProps {
  word: string;
  className?: string;
}

function isWordTranslatable(word: string): boolean {
  const trimmedWord = word.trim();
  if (!trimmedWord) return false;
  if (trimmedWord.length <= 1 && !trimmedWord.match(/[a-zA-Z]/)) return false; // Single non-alpha char
  if (/^\d+$/.test(trimmedWord)) return false; // Only numbers
  return true;
}

export function WordHoverTranslate({ word, className }: WordHoverTranslateProps) {
  const [translatedWord, setTranslatedWord] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tooltipMessage, setTooltipMessage] = React.useState<string | null>(null);

  const fetchTranslation = async (wordToTranslate: string) => {
    // This function is called only if isWordTranslatable is true from onOpenChange
    setIsLoading(true);
    setError(null);
    setTooltipMessage(null); // Clear "hazırlanıyor" message
    try {
      const result = await translateEnglishWordToTurkish({ englishWord: wordToTranslate.trim() });
      setTranslatedWord(result.turkishWord);
    } catch (err) {
      console.warn(`Kelime çevirme hatası (${wordToTranslate}):`, err);
      setError("Çeviri hatası");
      setTranslatedWord(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsTooltipOpen(open);
    if (open) {
      if (!translatedWord && !isLoading && !error) {
        if (isWordTranslatable(word)) {
          setTooltipMessage("Çeviri için hazırlanıyor...");
          fetchTranslation(word);
        } else {
          setTooltipMessage("Bu kelime çevrilmiyor.");
          setTranslatedWord(null); // Ensure no stale translation is shown
          setError(null);
        }
      } else {
        // If already loaded, or loading, or error, no special message needed
        setTooltipMessage(null);
      }
    } else {
      // Tooltip is closing
      setTooltipMessage(null);
      // Optional: Could cancel ongoing fetch here if significant
    }
  };

  const handleTriggerInteraction = () => {
    // Manually toggle the open state, which will then call onOpenChange
    setIsTooltipOpen(prev => !prev);
  };

  return (
    <TooltipProvider>
      <Tooltip
        open={isTooltipOpen}
        onOpenChange={handleOpenChange}
      >
        <TooltipTrigger asChild>
          <span
            className={cn(
              "hover:bg-accent/70 p-[1px] m-[-1px] rounded-sm transition-colors duration-150 outline-none cursor-pointer",
              className,
              isTooltipOpen ? "bg-accent/70" : ""
            )}
            tabIndex={0}
            onClick={handleTriggerInteraction}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTriggerInteraction();
              }
            }}
            role="button"
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
          {!isLoading && !translatedWord && !error && tooltipMessage && (
            <span className="text-xs">{tooltipMessage}</span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
