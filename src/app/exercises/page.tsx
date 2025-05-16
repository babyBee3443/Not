
// src/app/exercises/page.tsx
"use client";

import * as React from 'react';
import { AppHeader } from '@/components/app-header';
import { FillBlankForm, type FillBlankFormValues } from '@/components/fill-blank-form';
import { FillBlankDisplay } from '@/components/fill-blank-display';
import { generateFillBlankExercise, type GenerateFillBlankOutput } from '@/ai/flows/generate-fill-blank-flow';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2, BrainCircuit, ArrowLeft } from "lucide-react";
import { ScrollToTopButton } from '@/components/scroll-to-top-button';
import { Button } from '@/components/ui/button';

export default function FillBlankExercisePage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [exerciseData, setExerciseData] = React.useState<GenerateFillBlankOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [currentFormValues, setCurrentFormValues] = React.useState<FillBlankFormValues | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (values: FillBlankFormValues) => {
    setIsLoading(true);
    setExerciseData(null); 
    setError(null);
    setCurrentFormValues(values); 

    try {
      const result = await generateFillBlankExercise({
        topic: values.topic,
        gradeLevel: values.gradeLevel,
        difficultyLevel: values.difficultyLevel, // Pass difficultyLevel
      });
      setExerciseData(result);
      toast({
        title: "Alıştırma Hazır!",
        description: `"${values.topic}" konusu için ${values.difficultyLevel.toLowerCase()} seviyesinde boşluk doldurma alıştırması oluşturuldu.`,
      });
    } catch (err) {
      console.error("Error generating fill-in-the-blank exercise:", err);
      let errorMessage = "Alıştırma oluşturulurken bir hata oluştu. Lütfen girdilerinizi kontrol edin veya daha sonra tekrar deneyin.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNextExercise = () => {
    if (currentFormValues) {
        handleFormSubmit(currentFormValues); // This will use the stored difficultyLevel
    } else {
        setExerciseData(null); 
        toast({
            title: "Form Bilgisi Eksik",
            description: "Yeni alıştırma istemek için lütfen önce bir konu, sınıf ve zorluk seviyesi seçin.",
            variant: "destructive"
        });
    }
  };

  const handleGoBackToForm = () => {
    setExerciseData(null);
    setError(null);
    // setCurrentFormValues(null); // Optional: if you want form fields to reset fully
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex-1">
        <div className="mx-auto max-w-3xl space-y-8">
          {!exerciseData && !isLoading && ( 
            <div>
              <div className="text-center mb-8">
                <BrainCircuit className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-primary">Boşluk Doldurma Alıştırmaları</h1>
                <p className="text-muted-foreground mt-2">
                  Biyoloji bilginizi pekiştirin! Konu, sınıf ve zorluk seviyesi seçerek size özel boşluk doldurma alıştırmaları oluşturun.
                </p>
              </div>
              <FillBlankForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>
          )}

          {error && !isLoading && !exerciseData && (
            <Alert variant="destructive" className="mt-6">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Alıştırma Oluşturma Hatası</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
             <div className="flex flex-col justify-center items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground mt-4">Alıştırmanız hazırlanıyor...</p>
                <p className="text-sm text-muted-foreground mt-1">Bu işlem biraz zaman alabilir, lütfen bekleyin.</p>
             </div>
          )}
          
          {exerciseData && !isLoading && (
            <FillBlankDisplay 
              exerciseData={exerciseData} 
              onNextExercise={handleNextExercise}
              isLoadingNext={isLoading} 
              onGoBackToForm={handleGoBackToForm}
            />
          )}
        </div>
      </main>
      <ScrollToTopButton />
    </div>
  );
}

    