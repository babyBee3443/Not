// src/components/test-display.tsx
"use client";

import * as React from 'react';
import type { GenerateBiologyTestOutput, QuestionItemSchema as QuestionType } from '@/ai/flows/generate-biology-test-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, XCircle, HelpCircle, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TestDisplayProps {
  testData: GenerateBiologyTestOutput;
}

export function TestDisplay({ testData }: TestDisplayProps) {
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, number | null>>({});
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const { toast } = useToast();

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmitTest = () => {
    let currentScore = 0;
    testData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswerIndex) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setIsSubmitted(true);
    toast({
      title: "Test Tamamlandı!",
      description: `Skorunuz: ${currentScore} / ${testData.questions.length}`,
    });
  };

  // Reset state when testData changes (new test loaded)
  React.useEffect(() => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
  }, [testData]);

  const allQuestionsAnswered = testData.questions.length === Object.keys(selectedAnswers).filter(key => selectedAnswers[Number(key)] !== null).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-500 mt-8">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-primary-end p-6">
          <CardTitle className="text-3xl font-bold text-primary-foreground flex items-center gap-2">
            <ListChecks className="h-8 w-8" /> 
            {testData.testTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {testData.questions.map((question, qIndex) => (
            <Card key={qIndex} className="pt-4 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-foreground">Soru {qIndex + 1}:</CardTitle>
                <CardDescription className="text-base text-foreground/90 pt-1">{question.questionText}</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedAnswers[qIndex] !== null && selectedAnswers[qIndex] !== undefined ? String(selectedAnswers[qIndex]) : undefined}
                  onValueChange={(value) => handleAnswerChange(qIndex, Number(value))}
                  className="space-y-2"
                  disabled={isSubmitted}
                >
                  {question.options.map((option, oIndex) => {
                    let optionStyle = "font-normal text-foreground/90";
                    let FeedbackIcon = null;

                    if (isSubmitted) {
                      if (oIndex === question.correctAnswerIndex) {
                        optionStyle = "font-semibold text-green-600 dark:text-green-400";
                        FeedbackIcon = CheckCircle2;
                      } else if (selectedAnswers[qIndex] === oIndex && oIndex !== question.correctAnswerIndex) {
                        optionStyle = "font-normal text-red-600 dark:text-red-400 line-through";
                        FeedbackIcon = XCircle;
                      }
                    }

                    return (
                      <Label
                        key={oIndex}
                        htmlFor={`q${qIndex}-o${oIndex}`}
                        className={cn(
                          "flex items-center space-x-3 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer",
                          isSubmitted && selectedAnswers[qIndex] === oIndex && oIndex === question.correctAnswerIndex ? "border-green-500 bg-green-50 dark:bg-green-900/30" : "",
                          isSubmitted && selectedAnswers[qIndex] === oIndex && oIndex !== question.correctAnswerIndex ? "border-red-500 bg-red-50 dark:bg-red-900/30" : "",
                          isSubmitted && oIndex === question.correctAnswerIndex && selectedAnswers[qIndex] !== oIndex ? "border-green-300 dark:border-green-700" : ""
                        )}
                      >
                        <RadioGroupItem value={String(oIndex)} id={`q${qIndex}-o${oIndex}`} disabled={isSubmitted} />
                        <span className={optionStyle}>{option}</span>
                        {isSubmitted && FeedbackIcon && (
                            <FeedbackIcon className={cn("h-5 w-5 ml-auto", 
                                oIndex === question.correctAnswerIndex ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )} />
                        )}
                      </Label>
                    );
                  })}
                </RadioGroup>
              </CardContent>
              {isSubmitted && (
                <CardFooter className="bg-muted/30 dark:bg-muted/20 p-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`explanation-${qIndex}`}>
                      <AccordionTrigger className="text-sm font-medium text-primary hover:no-underline">
                        Doğru Cevabın Açıklaması
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap pt-2">
                        {question.explanation}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardFooter>
              )}
            </Card>
          ))}
        </CardContent>
        {!isSubmitted && (
          <CardFooter className="p-6 border-t">
            <Button 
              onClick={handleSubmitTest} 
              disabled={!allQuestionsAnswered || isSubmitted} 
              className="w-full sm:w-auto text-lg py-3 px-8"
            >
              Testi Bitir ve Kontrol Et
            </Button>
          </CardFooter>
        )}
         {isSubmitted && (
            <CardFooter className="p-6 border-t flex-col items-center gap-2">
                <p className="text-xl font-bold text-primary">Test Tamamlandı!</p>
                <p className="text-lg text-foreground">Skorunuz: <span className="font-bold">{score} / {testData.questions.length}</span></p>
                <Button onClick={() => { setSelectedAnswers({}); setIsSubmitted(false); setScore(0); }} variant="outline" className="mt-4">
                    Yeni Test Oluştur (Forma Dön)
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
