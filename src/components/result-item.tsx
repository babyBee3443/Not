"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ResultItemProps {
  title: string;
  content?: string;
  isLoading?: boolean;
  isTerm?: boolean; // Special styling for the main term
}

export function ResultItem({ title, content, isLoading = false, isTerm = false }: ResultItemProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      toast({ title: "Copied to clipboard!", description: `${title} content copied.` });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className={`shadow-lg ${isTerm ? 'border-primary border-2' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-xl font-semibold ${isTerm ? 'text-primary' : ''}`}>{title}</CardTitle>
        {content && !isLoading && (
          <Button variant="ghost" size="icon" onClick={handleCopy} aria-label={`Copy ${title}`}>
            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
          </Button>
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
