
"use client";

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import { InputForm, type InputFormValues } from '@/components/input-form';
import { ResultsDisplay } from '@/components/results-display';
import { ActivityItemCard } from '@/components/activity-item-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import type { AIResults, HistoryEntry, ExplanationMode } from '@/lib/types';
import { translateSentence } from '@/ai/flows/translate-sentence';
import { translateTerm } from '@/ai/flows/translate-term';
import { explainTerm } from '@/ai/flows/explain-term';
import { History, Star, Trash2, ChevronDown } from 'lucide-react';

// Using Math.random for pseudo-unique IDs as uuid isn't available in this environment.
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function BioLinguaLearnPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResults, setCurrentResults] = useState<AIResults | undefined>(undefined);
  const [currentInput, setCurrentInput] = useState<InputFormValues | undefined>(undefined);
  
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('bioLinguaHistory', []);
  const [favorites, setFavorites] = useLocalStorage<string[]>('bioLinguaFavorites', []);
  const [lastMode, setLastMode] = useLocalStorage<ExplanationMode>('bioLinguaLastMode', 'Beginner');
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);


  const { toast } = useToast();

  const handleFormSubmit = async (values: InputFormValues) => {
    setIsLoading(true);
    setCurrentResults(undefined); 
    setCurrentInput(values);
    setLastMode(values.mode);

    try {
      const results: AIResults = {};
      
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
      } else {
        console.error("Error translating term:", termRes.reason);
        toast({ title: "Error", description: "Failed to translate term.", variant: "destructive" });
      }
      
      if (explanationRes.status === 'fulfilled') {
        results.explanation = explanationRes.value.explanation;
        if (!results.englishTerm && explanationRes.value.englishTerm) {
           // results.englishTerm = explanationRes.value.englishTerm; 
        }
      } else {
        console.error("Error explaining term:", explanationRes.reason);
        toast({ title: "Error", description: "Failed to explain term.", variant: "destructive" });
      }
      
      setCurrentResults(results);

      const newHistoryEntry: HistoryEntry = {
        id: generateId(),
        timestamp: Date.now(),
        turkishInput: values.turkishInput,
        mode: values.mode,
        results,
      };
      setHistory(prevHistory => [newHistoryEntry, ...prevHistory.slice(0, 49)]);

    } catch (error) {
      console.error("AI processing error:", error);
      toast({ title: "Processing Error", description: "An unexpected error occurred.", variant: "destructive" });
      setCurrentResults({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryEntry) => {
    setCurrentInput({ turkishInput: item.turkishInput, mode: item.mode });
    setCurrentResults(item.results);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see the form
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
    setFavorites(prevFavorites => prevFavorites.filter(favId => !history.find(h => h.id === favId))); // Keep favorites that might not be in current history view if history was truncated
    toast({ title: "History Cleared" });
  };
  
  const handleClearFavorites = () => {
    setFavorites([]);
    toast({ title: "Favorites Cleared" });
  };

  const favoriteEntries = history.filter(item => favorites.includes(item.id));

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex-1">
        <div className="mx-auto max-w-3xl">
          <InputForm 
            onSubmit={handleFormSubmit} 
            isLoading={isLoading} 
            defaultValues={{ turkishInput: currentInput?.turkishInput || '', mode: currentInput?.mode || lastMode }}
          />
          <ResultsDisplay results={currentResults} isLoading={isLoading} turkishInput={currentInput?.turkishInput} />

          <Accordion 
            type="single" 
            collapsible 
            className="w-full mt-12"
            value={activeAccordionItem}
            onValueChange={setActiveAccordionItem}
          >
            <AccordionItem value="history">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Translation History
                  {history.length > 0 && <span className="text-sm font-normal text-muted-foreground">({history.length})</span>}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                {history.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearHistory}
                    className="mb-4"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear History
                  </Button>
                )}
                <ScrollArea className="h-[300px] pr-3">
                  {history.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">No history yet.</p>
                  ) : (
                    history.map(item => (
                      <ActivityItemCard
                        key={item.id}
                        item={item}
                        isFavorite={favorites.includes(item.id)}
                        onSelectItem={handleSelectHistoryItem}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))
                  )}
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="favorites">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Favorite Entries
                  {favoriteEntries.length > 0 && <span className="text-sm font-normal text-muted-foreground">({favoriteEntries.length})</span>}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                {favoriteEntries.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFavorites}
                    className="mb-4"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Favorites
                  </Button>
                )}
                <ScrollArea className="h-[300px] pr-3">
                  {favoriteEntries.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">No favorites yet.</p>
                  ) : (
                    favoriteEntries.map(item => (
                      <ActivityItemCard
                        key={item.id}
                        item={item}
                        isFavorite={true} // It's a favorite by definition here
                        onSelectItem={handleSelectHistoryItem}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))
                  )}
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </div>
  );
}
