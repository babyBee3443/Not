
"use client";

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import { InputForm, type InputFormValues } from '@/components/input-form';
import { ResultsDisplay } from '@/components/results-display';
import { ActivityItemCard } from '@/components/activity-item-card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import type { AIResults, HistoryEntry, ExplanationMode } from '@/lib/types';
import { translateSentence } from '@/ai/flows/translate-sentence';
import { translateTerm } from '@/ai/flows/translate-term';
import { explainTerm } from '@/ai/flows/explain-term';
import { translateEnglishToTurkish } from '@/ai/flows/translate-english-to-turkish';
import { History as HistoryIcon, Star, Trash2, Languages, Search, Printer, Loader2 } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function BioLinguaLearnPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPrintingPdf, setIsPrintingPdf] = useState(false);
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

    const normalizedSubmittedInput = values.turkishInput.trim().toLowerCase();
    const existingHistoryEntry = history.find(
      (entry) =>
        entry.turkishInput.trim().toLowerCase() === normalizedSubmittedInput &&
        entry.mode === values.mode
    );

    if (existingHistoryEntry) {
      setCurrentResults(existingHistoryEntry.results);
      toast({
        title: "Geçmişten Yüklendi",
        description: `"${values.turkishInput}" için sonuçlar geçmişten getirildi.`,
      });
      setIsLoading(false);
      return; 
    }

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
        toast({ title: "Hata", description: "Cümle çevrilemedi.", variant: "destructive" });
      }

      if (termRes.status === 'fulfilled') {
        results.englishTerm = termRes.value.englishTerm;
        results.definition = termRes.value.definition;
      } else {
        console.error("Error translating term:", termRes.reason);
        toast({ title: "Hata", description: "Terim çevrilemedi.", variant: "destructive" });
      }
      
      if (explanationRes.status === 'fulfilled') {
        results.explanation = explanationRes.value.explanation;
      } else {
        console.error("Error explaining term:", explanationRes.reason);
        toast({ title: "Hata", description: "Terim açıklanamadı.", variant: "destructive" });
      }
      
      setCurrentResults(results);

      const newHistoryEntry: HistoryEntry = {
        id: generateId(),
        timestamp: Date.now(),
        turkishInput: values.turkishInput.trim(),
        mode: values.mode,
        results,
      };
      setHistory(prevHistory => [newHistoryEntry, ...prevHistory.slice(0, 49)]);

    } catch (error) {
      console.error("AI processing error:", error);
      toast({ title: "İşlem Hatası", description: "Beklenmedik bir hata oluştu.", variant: "destructive" });
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
    setHistorySearchTerm('');
    toast({ title: "Geçmiş Temizlendi" });
  };
  
  const handleClearFavorites = () => {
    setFavorites([]);
    setFavoritesSearchTerm('');
    toast({ title: "Favoriler Temizlendi" });
  };

  const handlePrintToPdf = async () => {
    if (!currentResults || !currentInput) {
        toast({
            title: "PDF Oluşturulamadı",
            description: "Önce bir çeviri yapmanız gerekiyor.",
            variant: "destructive",
        });
        return;
    }
    setIsPrintingPdf(true);

    const fetchedTurkishTranslations: {
      term?: string;
      sentence?: string;
      definition?: string;
      explanation?: string;
    } = {};

    const translationPromises = [];

    if (currentResults.englishTerm) {
      translationPromises.push(
        translateEnglishToTurkish({ englishText: currentResults.englishTerm })
          .then(res => { fetchedTurkishTranslations.term = res.turkishText; })
          .catch(err => { console.error("PDF için terim çevirme hatası:", err); fetchedTurkishTranslations.term = "Çeviri alınamadı."; })
      );
    }
    if (currentResults.englishSentence) {
      translationPromises.push(
        translateEnglishToTurkish({ englishText: currentResults.englishSentence })
          .then(res => { fetchedTurkishTranslations.sentence = res.turkishText; })
          .catch(err => { console.error("PDF için cümle çevirme hatası:", err); fetchedTurkishTranslations.sentence = "Çeviri alınamadı."; })
      );
    }
    if (currentResults.definition) {
      translationPromises.push(
        translateEnglishToTurkish({ englishText: currentResults.definition })
          .then(res => { fetchedTurkishTranslations.definition = res.turkishText; })
          .catch(err => { console.error("PDF için tanım çevirme hatası:", err); fetchedTurkishTranslations.definition = "Çeviri alınamadı."; })
      );
    }
    if (currentResults.explanation) {
      translationPromises.push(
        translateEnglishToTurkish({ englishText: currentResults.explanation })
          .then(res => { fetchedTurkishTranslations.explanation = res.turkishText; })
          .catch(err => { console.error("PDF için açıklama çevirme hatası:", err); fetchedTurkishTranslations.explanation = "Çeviri alınamadı."; })
      );
    }

    await Promise.allSettled(translationPromises);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        const escapeHtml = (unsafe: string | undefined) => {
            if (!unsafe) return '';
            return unsafe
                 .replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
        }

        printWindow.document.write(\`
            <html>
            <head>
                <title>BioLinguaLearn Sonuçları</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
                    h1 { color: #0056b3; border-bottom: 2px solid #0056b3; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
                    .section { margin-bottom: 25px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                    .section-title { font-weight: bold; color: #007bff; margin-bottom: 8px; font-size: 18px; }
                    .translation-title { font-weight: bold; color: #28a745; margin-bottom: 5px; font-size: 16px; margin-top:10px; }
                    .content-text { white-space: pre-wrap; font-size: 16px; color: #444; }
                    @media print {
                        body { margin: 10mm; }
                        .section { box-shadow: none; border: 1px solid #ccc; page-break-inside: avoid; }
                        h1 { font-size: 20px; }
                        .section-title { font-size: 16px; }
                        .translation-title { font-size: 14px; }
                        .content-text { font-size: 14px; }
                    }
                </style>
            </head>
            <body>
                <h1>BioLinguaLearn Çeviri Sonuçları</h1>

                \${currentInput.turkishInput ? \`
                <div class="section">
                    <div class="section-title">Orijinal Girdi (Türkçe):</div>
                    <div class="content-text">\${escapeHtml(currentInput.turkishInput)}</div>
                </div>
                \` : ''}

                \${currentResults.englishTerm ? \`
                <div class="section">
                    <div class="section-title">İngilizce Terim:</div>
                    <div class="content-text">\${escapeHtml(currentResults.englishTerm)}</div>
                    \${fetchedTurkishTranslations.term ? \`
                        <div>
                            <div class="translation-title">İlgili Metnin Türkçe Çevirisi:</div>
                            <div class="content-text">\${escapeHtml(fetchedTurkishTranslations.term)}</div>
                        </div>
                    \` : ''}
                </div>
                \` : ''}

                \${currentResults.englishSentence ? \`
                <div class="section">
                    <div class="section-title">Tam İngilizce Çeviri:</div>
                    <div class="content-text">\${escapeHtml(currentResults.englishSentence)}</div>
                     \${fetchedTurkishTranslations.sentence ? \`
                        <div>
                            <div class="translation-title">İlgili Metnin Türkçe Çevirisi:</div>
                            <div class="content-text">\${escapeHtml(fetchedTurkishTranslations.sentence)}</div>
                        </div>
                    \` : ''}
                </div>
                \` : ''}

                \${currentResults.definition ? \`
                <div class="section">
                    <div class="section-title">Tanım:</div>
                    <div class="content-text">\${escapeHtml(currentResults.definition)}</div>
                     \${fetchedTurkishTranslations.definition ? \`
                        <div>
                            <div class="translation-title">İlgili Metnin Türkçe Çevirisi:</div>
                            <div class="content-text">\${escapeHtml(fetchedTurkishTranslations.definition)}</div>
                        </div>
                    \` : ''}
                </div>
                \` : ''}

                \${currentResults.explanation ? \`
                <div class="section">
                    <div class="section-title">Açıklama:</div>
                    <div class="content-text">\${escapeHtml(currentResults.explanation)}</div>
                     \${fetchedTurkishTranslations.explanation ? \`
                        <div>
                            <div class="translation-title">İlgili Metnin Türkçe Çevirisi:</div>
                            <div class="content-text">\${escapeHtml(fetchedTurkishTranslations.explanation)}</div>
                        </div>
                    \` : ''}
                </div>
                \` : ''}

                <script>
                    window.onload = function() {
                        window.print();
                        // Consider adding window.close(); here, but test thoroughly
                        // as it can be blocked by browsers or close too soon.
                    }
                </script>
            </body>
            </html>
        \`);
        printWindow.document.close();
    } else {
        toast({
            title: "Hata",
            description: "Yazdırma penceresi açılamadı. Lütfen pop-up engelleyicinizi kontrol edin.",
            variant: "destructive",
        });
    }
    setIsPrintingPdf(false);
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
                Çevir
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1">
                <HistoryIcon className="h-4 w-4" />
                Geçmiş {history.length > 0 && <span className="ml-1 text-xs">({history.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-1">
                <Star className="h-4 w-4" />
                Favoriler {favoriteEntries.length > 0 && <span className="ml-1 text-xs">({favoriteEntries.length})</span>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="translate">
              <InputForm 
                onSubmit={handleFormSubmit} 
                isLoading={isLoading} 
                defaultValues={{ turkishInput: currentInput?.turkishInput || '', mode: currentInput?.mode || lastMode }}
              />
              {currentResults && Object.keys(currentResults).length > 0 && (
                <div className="mt-6 flex justify-end">
                   <Button 
                     variant="outline" 
                     onClick={handlePrintToPdf}
                     disabled={isLoading || isPrintingPdf}
                     className="w-full sm:w-auto"
                   >
                     {isPrintingPdf ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          PDF Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <Printer className="mr-2 h-4 w-4" />
                          Sonuçları Yazdır
                        </>
                      )}
                   </Button>
                </div>
              )}
              <ResultsDisplay results={currentResults} isLoading={isLoading} turkishInput={currentInput?.turkishInput} />
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <div className="relative w-full sm:flex-grow">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Geçmişte ara..."
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
                      Geçmişi Temizle
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[400px] pr-3 border rounded-md">
                  {history.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">Henüz geçmiş kaydı yok.</p>
                  ) : filteredHistory.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">Eşleşen geçmiş kaydı bulunamadı.</p>
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
                        placeholder="Favorilerde ara..."
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
                      Favorileri Temizle
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[400px] pr-3 border rounded-md">
                  {favoriteEntries.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">Henüz favori yok.</p>
                  ) : filteredFavorites.length === 0 ? (
                     <p className="p-4 text-center text-sm text-muted-foreground">Eşleşen favori kaydı bulunamadı.</p>
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
    
