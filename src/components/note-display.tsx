
// src/components/note-display.tsx
"use client";

import * as React from 'react';
import type { GenerateBiologyNoteOutput } from '@/ai/flows/generate-biology-note-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Lightbulb, ListChecks, BookMarked, Youtube, CheckCircle2, XCircle, HelpCircle, ExternalLink, Share2 } from 'lucide-react'; // Added Share2 for relationships
import { useToast } from '@/hooks/use-toast';

interface NoteDisplayProps {
  noteData: GenerateBiologyNoteOutput;
}

export function NoteDisplay({ noteData }: NoteDisplayProps) {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = React.useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = React.useState<string | null>(null);
  const [showExplanation, setShowExplanation] = React.useState(false);
  const { toast } = useToast();

  const handleQuizSubmit = () => {
    if (selectedAnswerIndex === null) {
      toast({
        title: "Lütfen bir cevap seçin.",
        variant: "destructive",
      });
      return;
    }
    const isCorrect = selectedAnswerIndex === noteData.summaryQuiz.correctAnswerIndex;
    if (isCorrect) {
      setQuizFeedback("Tebrikler, doğru cevap!");
      toast({
        title: "Doğru Cevap!",
        description: "Harika gidiyorsun!",
        className: "bg-green-500 text-white", // Custom success toast
      });
    } else {
      setQuizFeedback(`Yanlış cevap. Doğru seçenek: ${noteData.summaryQuiz.options[noteData.summaryQuiz.correctAnswerIndex]}`);
       toast({
        title: "Yanlış Cevap",
        description: "Tekrar dene veya açıklamayı oku.",
        variant: "destructive",
      });
    }
    setShowExplanation(true);
  };

  // Reset quiz when noteData changes
  React.useEffect(() => {
    setSelectedAnswerIndex(null);
    setQuizFeedback(null);
    setShowExplanation(false);
  }, [noteData]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-500">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-primary-end p-6">
          <CardTitle className="text-3xl font-bold text-primary-foreground">{noteData.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-semibold text-foreground mb-2">Ders Notu</h3>
          <div 
            className="prose prose-sm sm:prose-base max-w-none dark:prose-invert text-foreground/90 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: noteData.content.replace(/\n/g, '<br />') }} 
          />
        </CardContent>
      </Card>

      {noteData.keyConcepts && noteData.keyConcepts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ListChecks className="h-6 w-6 text-primary" />
              Anahtar Kavramlar
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {noteData.keyConcepts.map((concept, index) => (
              <Badge key={index} variant="secondary" className="text-sm px-3 py-1">{concept}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {noteData.conceptRelationships && noteData.conceptRelationships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Share2 className="h-6 w-6 text-primary" /> {/* Using Share2 icon for relationships */}
              Kavram İlişkileri
            </CardTitle>
            <CardDescription>Bu konudaki önemli kavramlar arasındaki bazı ilişkiler:</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-foreground/90">
              {noteData.conceptRelationships.map((relationship, index) => (
                <li key={index} className="text-sm">{relationship}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {noteData.interestingFact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              İlginç Bilgi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 italic">{noteData.interestingFact}</p>
          </CardContent>
        </Card>
      )}

      {noteData.web2ToolSuggestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Youtube className="h-6 w-6 text-red-600" />
              Web 2.0 Araç Önerisi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-medium">{noteData.web2ToolSuggestion.name}</p>
            <p className="text-foreground/90">{noteData.web2ToolSuggestion.description}</p>
            {noteData.web2ToolSuggestion.url && (
              <Button variant="link" asChild className="p-0 h-auto">
                <a href={noteData.web2ToolSuggestion.url} target="_blank" rel="noopener noreferrer" className="text-sm">
                  Araca Git <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {noteData.summaryQuiz && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <HelpCircle className="h-6 w-6 text-primary" />
              Mini Test
            </CardTitle>
            <CardDescription>Konuyu ne kadar anladığını kontrol et!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium text-foreground">{noteData.summaryQuiz.question}</p>
            <RadioGroup
              value={selectedAnswerIndex !== null ? String(selectedAnswerIndex) : undefined}
              onValueChange={(value) => setSelectedAnswerIndex(Number(value))}
              className="space-y-2"
              disabled={showExplanation}
            >
              {noteData.summaryQuiz.options.map((option, index) => (
                <FormItem key={index} className="flex items-center space-x-3">
                  <FormControl>
                    <RadioGroupItem value={String(index)} id={`option-${index}`} />
                  </FormControl>
                  <Label htmlFor={`option-${index}`} className="font-normal text-foreground/90">{option}</Label>
                </FormItem>
              ))}
            </RadioGroup>
            <Button onClick={handleQuizSubmit} disabled={selectedAnswerIndex === null || showExplanation}>
              Cevabı Kontrol Et
            </Button>
            
            {quizFeedback && (
              <div className={`mt-4 p-3 rounded-md text-sm ${selectedAnswerIndex === noteData.summaryQuiz.correctAnswerIndex ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'} flex items-center gap-2`}>
                {selectedAnswerIndex === noteData.summaryQuiz.correctAnswerIndex ? <CheckCircle2 className="h-5 w-5"/> : <XCircle className="h-5 w-5"/>}
                {quizFeedback}
              </div>
            )}
          </CardContent>
          {showExplanation && (
            <CardFooter>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="explanation">
                  <AccordionTrigger className="text-sm font-medium">Doğru Cevabın Açıklaması</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {noteData.summaryQuiz.explanation}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}

// Helper types for FormField to avoid direct dependency if not needed.
type FormItemProps = React.ComponentProps<typeof Label> & { children: React.ReactNode };
function FormItem({ children, ...props }: FormItemProps) {
  return <div {...props}>{children}</div>;
}
type FormControlProps = { children: React.ReactNode };
function FormControl({ children }: FormControlProps) {
  return <div>{children}</div>;
}

