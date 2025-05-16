
// src/components/note-form.tsx
"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { GenerateBiologyNoteInput } from '@/ai/flows/generate-biology-note-flow';
import { Loader2, BookOpenText } from 'lucide-react';

const noteFormSchema = z.object({
  topic: z.string().min(3, { message: 'Konu en az 3 karakter olmalıdır.' }).max(150, { message: 'Konu 150 karakteri aşamaz.' }),
  gradeLevel: z.enum(['9', '10', '11', '12'], { errorMap: () => ({ message: "Lütfen geçerli bir sınıf seviyesi seçin."}) }),
  tone: z.enum(['Standard', 'Humorous', 'Engaging'], { errorMap: () => ({ message: "Lütfen geçerli bir anlatım tonu seçin."}) }),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;

interface NoteFormProps {
  onSubmit: (values: NoteFormValues) => void;
  isLoading: boolean;
}

export function NoteForm({ onSubmit, isLoading }: NoteFormProps) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      topic: '',
      gradeLevel: '9',
      tone: 'Engaging',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 border rounded-lg shadow-sm bg-card">
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Biyoloji Konusu</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Hücre Organelleri, Fotosentez, Kalıtım"
                  className="text-base p-3"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Öğrenmek istediğiniz biyoloji konusunu girin.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="gradeLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Sınıf Seviyesi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="text-base p-3 h-auto">
                      <SelectValue placeholder="Sınıf seviyesi seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="9">9. Sınıf</SelectItem>
                    <SelectItem value="10">10. Sınıf</SelectItem>
                    <SelectItem value="11">11. Sınıf</SelectItem>
                    <SelectItem value="12">12. Sınıf</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Notun hazırlanacağı sınıf seviyesi.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Anlatım Tonu</FormLabel>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                  disabled={isLoading}
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Standard" />
                    </FormControl>
                    <Label className="font-normal">Standart</Label>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Humorous" />
                    </FormControl>
                    <Label className="font-normal">Esprili</Label>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Engaging" />
                    </FormControl>
                    <Label className="font-normal">İlgi Çekici</Label>
                  </FormItem>
                </RadioGroup>
                <FormDescription>Notun hangi üslupla hazırlanacağı.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full sm:w-auto text-lg py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:scale-[1.03]" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Not Hazırlanıyor...
            </>
          ) : (
            <>
              <BookOpenText className="mr-2 h-5 w-5" />
              Bana Özel Not Hazırla!
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
