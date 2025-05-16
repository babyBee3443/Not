// src/components/test-form.tsx
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
import { Loader2, FileText } from 'lucide-react';

const testFormSchema = z.object({
  topic: z.string().min(3, { message: 'Konu en az 3 karakter olmalıdır.' }).max(150, { message: 'Konu 150 karakteri aşamaz.' }),
  gradeLevel: z.enum(['9', '10', '11', '12'], { errorMap: () => ({ message: "Lütfen geçerli bir sınıf seviyesi seçin."}) }),
  difficultyLevel: z.enum(['Kolay', 'Orta', 'Zor'], { errorMap: () => ({ message: "Lütfen geçerli bir zorluk seviyesi seçin."}) }),
  numberOfQuestions: z.coerce.number().min(1, {message: "En az 1 soru olmalıdır."}).max(10, {message: "En fazla 10 soru olabilir."}),
});

export type TestFormValues = z.infer<typeof testFormSchema>;

interface TestFormProps {
  onSubmit: (values: TestFormValues) => void;
  isLoading: boolean;
}

export function TestForm({ onSubmit, isLoading }: TestFormProps) {
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      topic: '',
      gradeLevel: '9',
      difficultyLevel: 'Orta',
      numberOfQuestions: 5,
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
              <FormLabel className="text-lg font-semibold">Test Konusu</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Hücre Bölünmeleri, Ekosistem Ekolojisi"
                  className="text-base p-3"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Testin hazırlanacağı biyoloji konusunu girin.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="gradeLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Sınıf Seviyesi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="text-base p-3 h-auto">
                      <SelectValue placeholder="Sınıf seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="9">9. Sınıf</SelectItem>
                    <SelectItem value="10">10. Sınıf</SelectItem>
                    <SelectItem value="11">11. Sınıf</SelectItem>
                    <SelectItem value="12">12. Sınıf</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficultyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Zorluk Seviyesi</FormLabel>
                 <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1 pt-2"
                  disabled={isLoading}
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="Kolay" /></FormControl>
                    <Label className="font-normal">Kolay</Label>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="Orta" /></FormControl>
                    <Label className="font-normal">Orta</Label>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="Zor" /></FormControl>
                    <Label className="font-normal">Zor</Label>
                  </FormItem>
                </RadioGroup>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="numberOfQuestions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Soru Sayısı</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    className="text-base p-3"
                    {...field}
                    onChange={event => field.onChange(+event.target.value)}
                    disabled={isLoading}
                  />
                </FormControl>
                 <FormDescription>1-10 arası.</FormDescription>
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
              Test Hazırlanıyor...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-5 w-5" />
              Test Oluştur
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
