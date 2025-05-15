
"use client";

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import { InputForm, type InputFormValues } from '@/components/input-form';
import { ResultsDisplay } from '@/components/results-display';
import { ActivityItemCard } from '@/components/activity-item-card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input'; // Import Input component
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import type { AIResults, HistoryEntry, ExplanationMode } from '@/lib/types';
import { translateSentence } from '@/ai/flows/translate-sentence';
import { translateTerm } from '@/ai/flows/translate-term';
import { explainTerm } from '@/ai/flows/explain-term';
import { History as HistoryIcon, Star, Trash2, Languages, Search } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function BioLinguaLearnPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResults, setCurrentResults] = useState<AIResults | undefined>(undefined);
  const [currentInput, setCurrentInput] = useState<InputFormValues | undefined>(undefined);
  
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('bioLinguaHistory', []);
  const [favorites, setFavorites] = useLocalStorage<string[]>('bioLinguaFavorites', []);
  const [lastMode, setLastMode] = useLocalStorage<ExplanationMode>('bioLinguaLastMode', 'Beginner');
  const [activeTab, setActiveTab] = useState<string>("translate");

  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [favoritesSearchTerm, setFavoritesSearchTerm] = useState('');

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
    setActiveTab("translate"); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
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
    setFavorites(prevFavorites => prevFavorites.filter(favId => !history.find(h => h.id === favId)));
    setHistorySearchTerm(''); // Clear search on history clear
    toast({ title: "History Cleared" });
  };
  
  const handleClearFavorites = () => {
    setFavorites([]);
    setFavoritesSearchTerm(''); // Clear search on favorites clear
    toast({ title: "Favorites Cleared" });
  };

  const favoriteEntries = history.filter(item => favorites.includes(item.id));

  const filteredHistory = history.filter(item => 
    item.turkishInput.toLowerCase().includes(historySearchTerm.toLowerCase())
  );

  const filteredFavorites = favoriteEntries.filter(item =>
    item.turkishInput.toLowerCase().includes(favoritesSearchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex-1">
        <div className="mx-auto max-w-3xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="translate" className="gap-1">
                <Languages className="h-4 w-4" />
                Translate
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1">
                <HistoryIcon className="h-4 w-4" />
                History {history.length > 0 && <span className="ml-1 text-xs">({history.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-1">
                <Star className="h-4 w-4" />
                Favorites {favoriteEntries.length > 0 && <span className="ml-1 text-xs">({favoriteEntries.length})</span>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="translate">
              <InputForm 
                onSubmit={handleFormSubmit} 
                isLoading={isLoading} 
                defaultValues={{ turkishInput: currentInput?.turkishInput || '', mode: currentInput?.mode || lastMode }}
              />
              <ResultsDisplay results={currentResults} isLoading={isLoading} turkishInput={currentInput?.turkishInput} />
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <div className="relative w-full sm:flex-grow">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search history..."
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      className="pl-8 w-full"
                    />
                  </div>
                  {history.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearHistory}
                      className="w-full sm:w-auto flex-shrink-0"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear History
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[400px] pr-3 border rounded-md">
                  {history.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">No history yet.</p>
                  ) : filteredHistory.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">No matching history entries found.</p>
                  ) : (
                    <div className="p-2 space-y-2">
                      {filteredHistory.map(item => (
                        <ActivityItemCard
                          key={item.id}
                          item={item}
                          isFavorite={favorites.includes(item.id)}
                          onSelectItem={handleSelectHistoryItem}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="favorites">
              <div className="space-y-4">
                 <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <div className="relative w-full sm:flex-grow">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search favorites..."
                        value={favoritesSearchTerm}
                        onChange={(e) => setFavoritesSearchTerm(e.target.value)}
                        className="pl-8 w-full"
                      />
                    </div>
                  {favoriteEntries.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFavorites}
                      className="w-full sm:w-auto flex-shrink-0"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Favorites
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[400px] pr-3 border rounded-md">
                  {favoriteEntries.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">No favorites yet.</p>
                  ) : filteredFavorites.length === 0 ? (
                     <p className="p-4 text-center text-sm text-muted-foreground">No matching favorite entries found.</p>
                  ) : (
                     <div className="p-2 space-y-2">
                      {filteredFavorites.map(item => (
                        <ActivityItemCard
                          key={item.id}
                          item={item}
                          isFavorite={true} 
                          onSelectItem={handleSelectHistoryItem}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
