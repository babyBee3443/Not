// src/app/notes/page.tsx
"use client";

import { AppHeader } from '@/components/app-header';

export default function NotesPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex-1">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Not Oluşturma Sayfası</h1>
          <p className="text-center text-muted-foreground">
            Bu alan yakında notlarınızı oluşturabileceğiniz ve yönetebileceğiniz özelliklerle güncellenecektir.
          </p>
          {/* Buraya not oluşturma form ve bileşenleri eklenecek */}
        </div>
      </main>
    </div>
  );
}
