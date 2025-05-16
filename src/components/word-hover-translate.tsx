
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
  // Allow single letters if they are indeed letters (e.g. 'a', 'I')
  if (trimmedWord.length === 1 && !trimmedWord.match(/[a-zA-Z]/i)) return false; 
  if (trimmedWord.length > 0 && /^\d+$/.test(trimmedWord)) return false; // Only numbers
  if (trimmedWord.length > 0 && !/[a-zA-Z]/.test(trimmedWord)) return false; // No letters at all (e.g. "---")
  return true;
}

export function WordHoverTranslate({ word, className }: WordHoverTranslateProps) {
  const [translatedWord, setTranslatedWord] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tooltipMessage, setTooltipMessage] = React.useState<string | null>(null);

  const fetchTranslation = async (wordToTranslate: string) => {
    setIsLoading(true);
    setError(null);
    // setTooltipMessage(null); // Clear "hazırlanıyor" message earlier if needed
    try {
      const result = await translateEnglishWordToTurkish({ englishWord: wordToTranslate.trim() });
      setTranslatedWord(result.turkishWord);
      setTooltipMessage(null); // Clear message once translation is successful
    } catch (err) {
      console.warn(`Kelime çevirme hatası (${wordToTranslate}):`, err);
      setError("Çeviri hatası");
      setTooltipMessage("Çeviri hatası"); // Show error in tooltip
      setTranslatedWord(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsTooltipOpen(open);
    if (open) {
      if (!isWordTranslatable(word)) {
        setTooltipMessage("Bu kelime çevrilemiyor.");
        setTranslatedWord(null);
        setError(null);
        setIsLoading(false);
      } else if (!translatedWord && !isLoading && !error) {
        setTooltipMessage("Çeviri için hazırlanıyor...");
        fetchTranslation(word);
      } else if (error) {
        setTooltipMessage("Çeviri hatası");
      } else if (isLoading) {
         setTooltipMessage("Çevriliyor...");
      } else {
        setTooltipMessage(null); // Already loaded, no message needed
      }
    } else {
      // Tooltip is closing
      // setTooltipMessage(null); // Clear message when closing if desired
    }
  };

  const handleTriggerInteraction = () => {
    // Manually toggle the open state, which will then call onOpenChange
    // This also ensures that on mobile, a tap opens it and subsequent logic in onOpenChange runs.
    setIsTooltipOpen(prev => !prev);
  };

  return (
    <TooltipProvider>
      <Tooltip
        open={isTooltipOpen}
        onOpenChange={handleOpenChange}
        delayDuration={300} // Slight delay before opening on hover
      >
        <TooltipTrigger asChild>
          <span
            className={cn(
              "hover:bg-accent/70 p-[1px] m-[-1px] rounded-sm transition-colors duration-150 outline-none cursor-pointer",
              className,
              isTooltipOpen ? "bg-accent/70" : ""
            )}
            onClick={handleTriggerInteraction} // For tap on mobile
            onKeyDown={(e) => { // For keyboard accessibility
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTriggerInteraction();
              }
            }}
            role="button"
            aria-expanded={isTooltipOpen}
            aria-label={`Çevir: ${word}`}
            tabIndex={0} // Make it focusable
          >
            {word}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs shadow-lg">
          {isLoading && <span className="text-xs">Çevriliyor...</span>}
          {!isLoading && translatedWord && <span className="text-sm font-medium">{translatedWord}</span>}
          {!isLoading && !translatedWord && tooltipMessage && (
            <span className="text-xs">{tooltipMessage}</span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
