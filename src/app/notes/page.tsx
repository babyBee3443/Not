
// src/app/notes/page.tsx
"use client";

import * as React from 'react';
import { AppHeader } from '@/components/app-header';
import { NoteForm, type NoteFormValues } from '@/components/note-form';
import { NoteDisplay } from '@/components/note-display';
import { generateBiologyNote, type GenerateBiologyNoteOutput } from '@/ai/flows/generate-biology-note-flow';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2, BookOpen } from "lucide-react";
import { ScrollToTopButton } from '@/components/scroll-to-top-button';

export default function NotesPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [noteData, setNoteData] = React.useState<GenerateBiologyNoteOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (values: NoteFormValues) => {
    setIsLoading(true);
    setNoteData(null);
    setError(null);

    try {
      const result = await generateBiologyNote({
        topic: values.topic,
        gradeLevel: values.gradeLevel,
        tone: values.tone,
        detailLevel: values.detailLevel,
      });
      setNoteData(result);
      toast({
        title: "Not Oluşturuldu!",
        description: `"${values.topic}" konusu için not başarıyla oluşturuldu.`,
      });
    } catch (err) {
      console.error("Error generating note:", err);
      let errorMessage = "Not oluşturulurken bir hata oluştu. Lütfen girdilerinizi kontrol edin veya daha sonra tekrar deneyin.";
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex-1">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <div className="text-center mb-8">
              <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-primary">Biyoloji Not Asistanı</h1>
              <p className="text-muted-foreground mt-2">
                Yapay zeka destekli biyoloji öğretmeni ile öğrenmek istediğin konuyu gir, sana özel notlar hazırlasın!
                Konu, sınıf seviyesi, anlatım tonu ve detay seviyesini seçerek öğrenme deneyimini kişiselleştir.
              </p>
            </div>
            <NoteForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>

          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Not Oluşturma Hatası</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && !noteData && (
             <div className="flex flex-col justify-center items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-lg text-muted-foreground mt-4">Notunuz hazırlanıyor, bu işlem biraz zaman alabilir...</p>
                <p className="text-sm text-muted-foreground mt-1">Lütfen bekleyin.</p>
             </div>
          )}

          {noteData && !isLoading && (
            <NoteDisplay noteData={noteData} />
          )}
        </div>
      </main>
      <ScrollToTopButton />
    </div>
  );
}
