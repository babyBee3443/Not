"use client";

import { useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { InputForm, type InputFormValues } from '@/components/input-form';
import { ResultsDisplay } from '@/components/results-display';
import { HistorySidebar } from '@/components/history-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import type { AIResults, HistoryEntry, ExplanationMode } from '@/lib/types';
import { translateSentence } from '@/ai/flows/translate-sentence';
import { translateTerm } from '@/ai/flows/translate-term';
import { explainTerm } from '@/ai/flows/explain-term';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Install uuid: npm install uuid @types/uuid
// Since we cannot modify package.json, we'll use Math.random for pseudo-unique IDs
// A proper solution would be to install uuid. For now, this is a placeholder.
const generateId = () => Math.random().toString(36).substr(2, 9);


export default function BioLinguaLearnPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResults, setCurrentResults] = useState<AIResults | undefined>(undefined);
  const [currentInput, setCurrentInput] = useState<InputFormValues | undefined>(undefined);
  
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('bioLinguaHistory', []);
  const [favorites, setFavorites] = useLocalStorage<string[]>('bioLinguaFavorites', []);
  const [lastMode, setLastMode] = useLocalStorage<ExplanationMode>('bioLinguaLastMode', 'Beginner');


  const { toast } = useToast();

  const handleFormSubmit = async (values: InputFormValues) => {
    setIsLoading(true);
    setCurrentResults(undefined); // Clear previous results
    setCurrentInput(values);
    setLastMode(values.mode);

    try {
      const results: AIResults = {};
      
      // Parallel execution (optional, can be sequential if preferred or if dependencies exist)
      const [sentenceRes, termRes, explanationRes] = await Promise.allSettled([
        translateSentence({ turkishSentence: values.turkishInput }),
        translateTerm({ turkishTerm: values.turkishInput, mode: values.mode }),
        explainTerm({ term: values.turkishInput, mode: values.mode })
      ]);

      if (sentenceRes.status === 'fulfilled') {
        results.englishSentence = sentenceRes.value.englishSentence;
      } else {
        console.error("Error translating sentence:", sentenceRes.reason);
        toast({ title: "Error", description: "Failed to translate sentence.", variant: "destructive" });
      }

      if (termRes.status === 'fulfilled') {
        results.englishTerm = termRes.value.englishTerm;
        results.definition = termRes.value.definition;
        // If fullTranslation from translateTerm is desired, it can be added here.
        // For now, translateSentence handles the full input translation.
      } else {
        console.error("Error translating term:", termRes.reason);
        toast({ title: "Error", description: "Failed to translate term.", variant: "destructive" });
      }
      
      if (explanationRes.status === 'fulfilled') {
        results.explanation = explanationRes.value.explanation;
        // If explainTerm flow also returns englishTerm, ensure consistency or prioritize one.
        // Current explainTerm flow returns englishTerm and explanation.
        // We can use termRes for englishTerm and explanationRes for explanation.
        if (!results.englishTerm && explanationRes.value.englishTerm) {
           // results.englishTerm = explanationRes.value.englishTerm; // Potentially overwrite if termRes failed but this succeeded
        }
      } else {
        console.error("Error explaining term:", explanationRes.reason);
        toast({ title: "Error", description: "Failed to explain term.", variant: "destructive" });
      }
      
      setCurrentResults(results);

      // Add to history
      const newHistoryEntry: HistoryEntry = {
        id: generateId(),
        timestamp: Date.now(),
        turkishInput: values.turkishInput,
        mode: values.mode,
        results,
      };
      setHistory(prevHistory => [newHistoryEntry, ...prevHistory.slice(0, 49)]); // Keep max 50 items

    } catch (error) {
      console.error("AI processing error:", error);
      toast({ title: "Processing Error", description: "An unexpected error occurred.", variant: "destructive" });
      setCurrentResults({}); // Show empty results or error state
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryEntry) => {
    setCurrentInput({ turkishInput: item.turkishInput, mode: item.mode });
    setCurrentResults(item.results);
    // Optionally, re-submit form or directly display. For now, direct display.
    // To re-submit, call handleFormSubmit(item) but that makes another AI call.
    // It's better to just populate the form and results display.
    // The InputForm component might need a way to be reset with these values.
    // For now, we just update results. User can copy from history to form.
  };

  const handleToggleFavorite = (itemId: string) => {
    setFavorites(prevFavorites =>
      prevFavorites.includes(itemId)
        ? prevFavorites.filter(id => id !== itemId)
        : [...prevFavorites, itemId]
    );
  };

  const handleClearHistory = () => {
    setHistory([]);
    setFavorites([]); // Also clear favorites if they are linked to history IDs
    toast({ title: "History Cleared" });
  };
  
  const handleClearFavorites = () => {
    setFavorites([]);
    toast({ title: "Favorites Cleared" });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1">
        <SidebarInset className="flex-1 overflow-auto">
          <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <InputForm 
                onSubmit={handleFormSubmit} 
                isLoading={isLoading} 
                defaultValues={{ turkishInput: currentInput?.turkishInput || '', mode: currentInput?.mode || lastMode }}
              />
              <ResultsDisplay results={currentResults} isLoading={isLoading} turkishInput={currentInput?.turkishInput} />
            </div>
          </main>
        </SidebarInset>
        <HistorySidebar
          history={history}
          favorites={favorites}
          onSelectHistoryItem={handleSelectHistoryItem}
          onToggleFavorite={handleToggleFavorite}
          onClearHistory={handleClearHistory}
          onClearFavorites={handleClearFavorites}
        />
      </div>
    </div>
  );
}
