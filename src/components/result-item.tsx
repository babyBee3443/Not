
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const [showTurkish, setShowTurkish] = useState(false);
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
      if (isSpeaking) { // If it was speaking this item, and we click again, just stop.
        setIsSpeaking(false);
        return;
      }
      // If it was speaking another item, cancel() already handled it,
      // and we'll proceed to speak the new item.
    }
    
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'en-US';
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
    };
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
    // Cleanup function to cancel speech if component unmounts while speaking
    return () => {
      if (isSpeaking && typeof window !== 'undefined' && window.speechSynthesis) {
        // window.speechSynthesis.cancel(); // Potentially problematic if rapidly changing content
      }
    };
  }, [isSpeaking]); 
  
  useEffect(() => {
    // When content changes, stop any ongoing speech for this item.
    // This prevents audio from a previous state playing over new content.
    if (isSpeaking) {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel(); // This cancels all speech, ensure it's desired.
        }
      setIsSpeaking(false); // Reset speaking state as speech is now stopped.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]); // Only re-run if content changes

  const toggleShowTurkish = () => {
    setShowTurkish(prev => !prev);
  };

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
            {turkishEquivalent && (
              <div className="mt-4 pt-3 border-t border-border/70">
                <Button variant="outline" size="sm" onClick={toggleShowTurkish} className="mb-2 text-xs">
                  {showTurkish ? <EyeOff className="mr-2 h-3 w-3" /> : <Eye className="mr-2 h-3 w-3" />}
                  {showTurkish ? "Türkçe Orijinalini Gizle" : "Türkçe Orijinalini Göster"}
                </Button>
                {showTurkish && (
                  <div className="p-3 bg-muted/30 rounded-md">
                    <p className="text-sm font-medium text-muted-foreground">Türkçe Orijinali:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{turkishEquivalent}</p>
                  </div>
                )}
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
