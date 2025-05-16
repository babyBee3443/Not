// src/components/fill-blank-display.tsx
"use client";

import * as React from 'react';
import type { GenerateFillBlankOutput } from '@/ai/flows/generate-fill-blank-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FillBlankDisplayProps {
  exerciseData: GenerateFillBlankOutput;
  onNextExercise: () => void; // Callback to trigger fetching a new exercise
  isLoadingNext: boolean; // To disable button while next exercise is loading
}

export function FillBlankDisplay({ exerciseData, onNextExercise, isLoadingNext }: FillBlankDisplayProps) {
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const { toast } = useToast();

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) {
      toast({
        title: "Lütfen bir cevap seçin.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitted(true);
    if (selectedAnswer === exerciseData.correctAnswer) {
      toast({
        title: "Doğru Cevap!",
        description: "Harika iş çıkardın!",
        className: "bg-green-500 text-white",
      });
    } else {
      toast({
        title: "Yanlış Cevap",
        description: `Doğru cevap: ${exerciseData.correctAnswer}`,
        variant: "destructive",
      });
    }
  };

  // Reset component state when new exerciseData comes in
  React.useEffect(() => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
  }, [exerciseData]);

  const sentenceParts = exerciseData.exerciseSentence.split('__BLANK__');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-500 mt-8">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-primary-end p-6">
          <CardTitle className="text-2xl font-bold text-primary-foreground flex items-center gap-2">
            <HelpCircle className="h-7 w-7" />
            Boşluk Doldurma Alıştırması
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="text-lg text-foreground/90 leading-relaxed">
            {sentenceParts[0]}
            <span className="inline-block px-4 py-1 border-b-2 border-dashed border-muted-foreground mx-1 align-bottom min-w-[100px] text-center">
              {isSubmitted ? exerciseData.correctAnswer : (selectedAnswer || '...')}
            </span>
            {sentenceParts[1]}
          </div>

          <RadioGroup
            value={selectedAnswer ?? undefined}
            onValueChange={(value) => setSelectedAnswer(value)}
            className="space-y-2 pt-4"
            disabled={isSubmitted}
          >
            {exerciseData.options.map((option, index) => {
              let optionStyle = "font-normal text-foreground/90";
              let FeedbackIcon = null;

              if (isSubmitted) {
                if (option === exerciseData.correctAnswer) {
                  optionStyle = "font-semibold text-green-600 dark:text-green-400";
                  FeedbackIcon = CheckCircle2;
                } else if (selectedAnswer === option && option !== exerciseData.correctAnswer) {
                  optionStyle = "font-normal text-red-600 dark:text-red-400 line-through";
                  FeedbackIcon = XCircle;
                }
              }
              return (
                <Label
                  key={index}
                  htmlFor={`option-${index}`}
                  className={cn(
                    "flex items-center space-x-3 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer",
                    isSubmitted && selectedAnswer === option && option === exerciseData.correctAnswer ? "border-green-500 bg-green-50 dark:bg-green-900/30" : "",
                    isSubmitted && selectedAnswer === option && option !== exerciseData.correctAnswer ? "border-red-500 bg-red-50 dark:bg-red-900/30" : "",
                    isSubmitted && option === exerciseData.correctAnswer && selectedAnswer !== option ? "border-green-300 dark:border-green-700" : ""
                  )}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} disabled={isSubmitted} />
                  <span className={optionStyle}>{option}</span>
                  {isSubmitted && FeedbackIcon && (
                      <FeedbackIcon className={cn("h-5 w-5 ml-auto", 
                          option === exerciseData.correctAnswer ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )} />
                  )}
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
        <CardFooter className="p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
          <Button onClick={onNextExercise} variant="outline" className="w-full sm:w-auto" disabled={isLoadingNext}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingNext ? 'animate-spin' : ''}`} />
            {isLoadingNext ? "Yükleniyor..." : "Yeni Alıştırma İste"}
          </Button>
          <Button onClick={handleCheckAnswer} disabled={isSubmitted || selectedAnswer === null} className="w-full sm:w-auto text-lg py-3">
            Cevabı Kontrol Et
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
