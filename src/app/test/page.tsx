// src/app/test/page.tsx
"use client";

import * as React from 'react';
import { AppHeader } from '@/components/app-header';
import { TestForm, type TestFormValues } from '@/components/test-form';
import { TestDisplay } from '@/components/test-display';
import { generateBiologyTest, type GenerateBiologyTestOutput } from '@/ai/flows/generate-biology-test-flow';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2, Newspaper } from "lucide-react";

export default function TestPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [testData, setTestData] = React.useState<GenerateBiologyTestOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (values: TestFormValues) => {
    setIsLoading(true);
    setTestData(null); 
    setError(null);

    try {
      const result = await generateBiologyTest({
        topic: values.topic,
        gradeLevel: values.gradeLevel,
        difficultyLevel: values.difficultyLevel,
        numberOfQuestions: values.numberOfQuestions,
      });
      setTestData(result);
      toast({
        title: "Test Oluşturuldu!",
        description: `"${values.topic || 'Genel'}" konusu için ${values.numberOfQuestions} soruluk test başarıyla oluşturuldu.`,
      });
    } catch (err) {
      console.error("Error generating test:", err);
      let errorMessage = "Test oluşturulurken bir hata oluştu.";
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

  const handleResetToForm = () => {
    setTestData(null);
    setError(null); 
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex-1">
        <div className="mx-auto max-w-3xl space-y-8">
          {!testData ? (
            <div>
              <div className="text-center mb-8">
                 <Newspaper className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-primary">Biyoloji Test Oluşturucu</h1>
                <p className="text-muted-foreground mt-2">
                  İstediğiniz konu, sınıf seviyesi, zorluk ve soru sayısını belirterek size özel biyoloji testleri hazırlayın!
                </p>
              </div>
              <TestForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>
          ) : null}

          {error && !testData && ( 
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Test Oluşturma Hatası</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && !testData && (
             <div className="flex flex-col justify-center items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-lg text-muted-foreground mt-4">Testiniz hazırlanıyor, lütfen bekleyin...</p>
             </div>
          )}
          
          {testData && !isLoading && (
            <TestDisplay testData={testData} onResetTest={handleResetToForm} />
          )}
        </div>
      </main>
    </div>
  );
}
