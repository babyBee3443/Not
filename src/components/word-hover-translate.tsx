
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

  // This function is called when the tooltip is triggered to open.
  // The primary checks (e.g., not already translated, not loading) are performed
  // by the caller in `onOpenChange`.
  const fetchTranslation = async (wordToTranslate: string) => {
    // Trim the word to handle potential leading/trailing whitespace.
    const trimmedWord = wordToTranslate.trim();

    if (!trimmedWord) {
      // If the word is empty or just whitespace after trimming, no need to translate.
      // Set translatedWord to the original to avoid repeated attempts.
      setTranslatedWord(wordToTranslate); 
      return;
    }
    
    // Avoid translating very short words (single non-alpha) or numbers-only words.
    // This prevents unnecessary API calls for punctuation, etc.
    if (trimmedWord.length <= 1 && !trimmedWord.match(/[a-zA-Z]/) ) {
        setTranslatedWord(trimmedWord); // Show original if not conventionally translatable
        return;
    }
    if (/^\d+$/.test(trimmedWord)) { // Checks if the word consists only of digits
        setTranslatedWord(trimmedWord); // Show original if just numbers
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Use the trimmed word for translation.
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

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip open={isTooltipOpen} onOpenChange={(open) => {
        setIsTooltipOpen(open);
        // Fetch translation only when the tooltip is opening and we don't have a translation/error yet,
        // and the component isn't already loading a translation.
        if (open && !translatedWord && !isLoading && !error) {
          fetchTranslation(word); // Pass the original word prop
        }
      }}>
        <TooltipTrigger asChild>
          {/* This span acts as the trigger. On mobile, tapping this span should open the tooltip. */}
          <span className={cn("cursor-default hover:bg-accent/70 p-[1px] m-[-1px] rounded-sm transition-colors duration-150", className)}>
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

