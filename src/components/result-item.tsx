
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Volume2, VolumeX, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { translateEnglishToTurkish } from '@/ai/flows/translate-english-to-turkish';

interface ResultItemProps {
  title: string;
  content?: string;
  isLoading?: boolean;
  isTerm?: boolean;
  turkishEquivalent?: string; // This is the original user's Turkish input
}

export function ResultItem({ title, content, isLoading = false, isTerm = false, turkishEquivalent }: ResultItemProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTurkishTranslation, setShowTurkishTranslation] = useState(false);
  const [translatedTurkishText, setTranslatedTurkishText] = useState<string | null>(null);
  const [isTranslatingToTurkish, setIsTranslatingToTurkish] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      toast({ title: "Panoya kopyalandı!", description: `${title} içeriği kopyalandı.` });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = () => {
    if (!content || typeof window === 'undefined' || !window.speechSynthesis) {
      toast({ title: "Konuşma özelliği mevcut değil", description: "Tarayıcınız metin okuma özelliğini desteklemiyor.", variant: "destructive" });
      return;
    }

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }
    }
    
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'en-US';
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      if (event.error === 'interrupted') {
        console.warn("Speech synthesis interrupted. Code:", event.error, "Content length:", content?.length);
      } else {
        console.error("Speech synthesis error. Code:", event.error, "Content length:", content?.length);
        toast({ title: "Konuşma Hatası", description: "Ses oynatılamadı.", variant: "destructive" });
      }
      setIsSpeaking(false);
    };
    
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (isSpeaking && typeof window !== 'undefined' && window.speechSynthesis) {
        // speechSynthesis.cancel(); // Potentially problematic
      }
    };
  }, [isSpeaking]); 
  
  useEffect(() => {
    if (isSpeaking) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
    // Reset translation when content changes
    setShowTurkishTranslation(false);
    setTranslatedTurkishText(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const toggleShowTurkishTranslation = async () => {
    if (!showTurkishTranslation && !translatedTurkishText && content) {
      setIsTranslatingToTurkish(true);
      try {
        const result = await translateEnglishToTurkish({ englishText: content });
        setTranslatedTurkishText(result.turkishText);
      } catch (error) {
        console.error("Error translating English to Turkish:", error);
        toast({ title: "Çeviri Hatası", description: "İngilizce metin Türkçeye çevrilemedi.", variant: "destructive" });
        setTranslatedTurkishText("Çeviri alınamadı.");
      } finally {
        setIsTranslatingToTurkish(false);
      }
    }
    setShowTurkishTranslation(prev => !prev);
  };

  // Determine if the content is primarily English or different from the original Turkish input
  // This is a heuristic. A more robust check might involve language detection.
  const isContentLikelyEnglishAndNotOriginalInput = content && (title !== "Orijinal Girdi (Türkçe)");

  return (
    <Card className={`shadow-lg ${isTerm ? 'border-primary/50 border-2' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-xl font-semibold ${isTerm ? 'text-primary' : ''}`}>{title}</CardTitle>
        {content && !isLoading && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleCopy} aria-label={`${title} kopyala`}>
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSpeak} aria-label={`${title} seslendir`}>
              {isSpeaking ? <VolumeX className="h-5 w-5 text-primary" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
          </div>
        ) : content ? (
          <>
            <p className={`text-base leading-relaxed whitespace-pre-wrap ${isTerm ? 'text-lg font-semibold' : ''}`}>{content}</p>
            {isContentLikelyEnglishAndNotOriginalInput && (
              <div className="mt-4 pt-3 border-t border-border/70">
                <Button variant="outline" size="sm" onClick={toggleShowTurkishTranslation} className="mb-2 text-xs">
                  {showTurkishTranslation ? <EyeOff className="mr-2 h-3 w-3" /> : <Eye className="mr-2 h-3 w-3" />}
                  {showTurkishTranslation ? "Türkçe Çeviriyi Gizle" : "Bu Metnin Türkçesini Göster"}
                </Button>
                {showTurkishTranslation && (
                  <div className="p-3 bg-muted/30 rounded-md">
                    {isTranslatingToTurkish ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Türkçeye çevriliyor...
                      </div>
                    ) : translatedTurkishText ? (
                      <>
                        <p className="text-sm font-medium text-muted-foreground">Bu Metnin Türkçe Çevirisi:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{translatedTurkishText}</p>
                      </>
                    ) : (
                       <p className="text-sm text-muted-foreground italic">Çeviri yüklenemedi.</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Optionally, show the original user input if it's different from the main content and relevant */}
            {turkishEquivalent && content !== turkishEquivalent && title !== "Orijinal Girdi (Türkçe)" && !isContentLikelyEnglishAndNotOriginalInput && (
                 <div className="mt-2 pt-2 border-t border-dashed border-border/50">
                     <p className="text-xs font-medium text-muted-foreground">Orijinal Sorgu:</p>
                     <p className="text-xs text-muted-foreground whitespace-pre-wrap">{turkishEquivalent}</p>
                 </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground italic">Bilgi bulunmamaktadır.</p>
        )}
      </CardContent>
    </Card>
  );
}
