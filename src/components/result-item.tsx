
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ResultItemProps {
  title: string;
  content?: string;
  isLoading?: boolean;
  isTerm?: boolean; // Special styling for the main term
}

export function ResultItem({ title, content, isLoading = false, isTerm = false }: ResultItemProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      toast({ title: "Copied to clipboard!", description: `${title} content copied.` });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = () => {
    if (!content || typeof window === 'undefined' || !window.speechSynthesis) {
      toast({ title: "Speech not available", description: "Your browser doesn't support text-to-speech.", variant: "destructive" });
      return;
    }

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel(); // Stop any currently speaking utterance
      if (isSpeaking) { // If this item was the one speaking, just toggle off
        setIsSpeaking(false);
        return;
      }
      // If another item was speaking, it's now cancelled. We'll proceed to speak this one.
    }
    
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'en-US'; // Specify English
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      if (event.error === 'interrupted') {
        // Log interruptions as warnings, as they are often intentional
        console.warn("Speech synthesis interrupted. Code:", event.error, "Content length:", content?.length);
      } else {
        // Log other errors as actual errors
        console.error("Speech synthesis error. Code:", event.error, "Content length:", content?.length);
        toast({ title: "Speech Error", description: "Could not play audio.", variant: "destructive" });
      }
      setIsSpeaking(false);
    };
    
    speechSynthesis.speak(utterance);
  };

  // Effect to ensure speaking state is reset if component unmounts
  useEffect(() => {
    return () => {
      if (isSpeaking && typeof window !== 'undefined' && window.speechSynthesis) {
        // Check if the current component's utterance is the one speaking, though this is hard to do reliably.
        // Generally, cancelling all speech on unmount if this component was 'active' can be a strategy,
        // but might be too broad if speech is meant to persist.
        // For now, relying on explicit stop/cancellation logic in handleSpeak and content change.
      }
    };
  }, [isSpeaking]); 
  
  // If content changes, and this item was speaking, stop it.
  useEffect(() => {
    if (isSpeaking) {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
      setIsSpeaking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);


  return (
    <Card className={`shadow-lg ${isTerm ? 'border-primary border-2' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-xl font-semibold ${isTerm ? 'text-primary' : ''}`}>{title}</CardTitle>
        {content && !isLoading && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleCopy} aria-label={`Copy ${title}`}>
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSpeak} aria-label={`Speak ${title}`}>
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
          <p className={`text-base leading-relaxed whitespace-pre-wrap ${isTerm ? 'text-2xl font-bold' : ''}`}>{content}</p>
        ) : (
          <p className="text-muted-foreground italic">No information available.</p>
        )}
      </CardContent>
    </Card>
  );
}
