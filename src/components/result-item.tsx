
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Volume2, VolumeX, Eye, EyeOff, Loader2, Languages } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { translateEnglishToTurkish } from '@/ai/flows/translate-english-to-turkish';
import { WordHoverTranslate } from './word-hover-translate'; // Yeni bileşeni import et

interface ResultItemProps {
  title: string;
  content?: string;
  isLoading?: boolean;
  isTerm?: boolean;
  turkishEquivalent?: string; 
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
        console.warn("Konuşma sentezi kesildi. Kod:", event.error, "İçerik uzunluğu:", content?.length);
      } else {
        console.error("Konuşma sentezi hatası. Kod:", event.error, "İçerik uzunluğu:", content?.length);
        toast({ title: "Konuşma Hatası", description: "Ses oynatılamadı.", variant: "destructive" });
      }
      setIsSpeaking(false);
    };
    
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      // Component unmount olduğunda veya isSpeaking değiştiğinde konuşmayı durdur
      if (isSpeaking && typeof window !== 'undefined' && window.speechSynthesis && speechSynthesis.speaking) {
        // speechSynthesis.cancel(); // Bu satır bazen "interrupted" hatalarına neden olabiliyor
      }
    };
  }, [isSpeaking]); 
  
  useEffect(() => {
    if (isSpeaking) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
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
        console.error("İngilizce'den Türkçe'ye çeviri hatası:", error);
        toast({ title: "Çeviri Hatası", description: "İngilizce metin Türkçeye çevrilemedi.", variant: "destructive" });
        setTranslatedTurkishText("Çeviri alınamadı.");
      } finally {
        setIsTranslatingToTurkish(false);
      }
    }
    setShowTurkishTranslation(prev => !prev);
  };

  const isContentLikelyEnglishAndNotOriginalInput = content && (title !== "Orijinal Girdi (Türkçe)");

  const renderedContent = useMemo(() => {
    if (!content || !isContentLikelyEnglishAndNotOriginalInput) {
      return <p className={`text-base leading-relaxed whitespace-pre-wrap ${isTerm ? 'text-lg font-semibold' : ''}`}>{content || ""}</p>;
    }
    // Metni kelimelere ve noktalama işaretlerine ayır
    // ([a-zA-Z'-]+) kelimeleri yakalar
    // ([^a-zA-Z'-]+) kelime olmayanları (boşluk, noktalama) yakalar
    const segments = content.match(/([a-zA-Z0-9'-]+)|([^a-zA-Z0-9'-]+)/g) || [];
    
    return (
      <p className={`text-base leading-relaxed whitespace-pre-wrap ${isTerm ? 'text-lg font-semibold' : ''}`}>
        {segments.map((segment, index) => {
          // Eğer segment bir kelime ise (harf içeriyorsa) WordHoverTranslate ile sar
          if (/[a-zA-Z]/.test(segment) && segment.length > 1) { // Kelime olup olmadığını kontrol et (harf içermeli ve >1 karakter)
            return <WordHoverTranslate key={`${index}-${segment}`} word={segment} />;
          }
          // Değilse (boşluk, noktalama vb.) olduğu gibi bırak
          return <span key={`${index}-${segment}`}>{segment}</span>;
        })}
      </p>
    );
  }, [content, isContentLikelyEnglishAndNotOriginalInput, isTerm]);


  return (
    <Card className={`shadow-lg ${isTerm ? 'border-primary/50 border-2' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-xl font-semibold ${isTerm ? 'text-primary' : ''}`}>{title}</CardTitle>
        {content && !isLoading && (
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleCopy} aria-label={`${title} kopyala`}>
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Kopyala</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleSpeak} aria-label={`${title} seslendir`}>
                    {isSpeaking ? <VolumeX className="h-5 w-5 text-primary" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Seslendir</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
            {renderedContent}
            {isContentLikelyEnglishAndNotOriginalInput && (
              <div className="mt-4 pt-3 border-t border-border/70">
                <Button variant="outline" size="sm" onClick={toggleShowTurkishTranslation} className="mb-2 text-xs">
                  {showTurkishTranslation ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                  {showTurkishTranslation ? "Türkçe Çeviriyi Gizle" : "Bu Metnin Türkçesini Göster"}
                  {isTranslatingToTurkish && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
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
                        <p className="text-sm font-medium text-foreground/80">Bu Metnin Türkçe Çevirisi:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{translatedTurkishText}</p>
                      </>
                    ) : (
                       <p className="text-sm text-muted-foreground italic">Çeviri yüklenemedi.</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {turkishEquivalent && content !== turkishEquivalent && title === "Orijinal Girdi (Türkçe)" && (
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
