
"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { ExplanationMode } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  turkishInput: z.string().min(1, { message: 'Lütfen bir metin girin.' }).max(500, { message: 'Giriş 500 karakteri aşamaz.' }),
  mode: z.enum(['Beginner', 'Advanced']),
});

export type InputFormValues = z.infer<typeof formSchema>;

interface InputFormProps {
  onSubmit: (values: InputFormValues) => void;
  isLoading: boolean;
  defaultValues?: Partial<InputFormValues>;
}

export function InputForm({ onSubmit, isLoading, defaultValues }: InputFormProps) {
  const form = useForm<InputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      turkishInput: '',
      mode: 'Beginner',
      ...defaultValues,
    },
  });

  React.useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent new line
      if (!isLoading) {
        // Directly call handleSubmit; it will internally call the onSubmit passed to it.
        form.handleSubmit(onSubmit)();
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="turkishInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Türkçe Terim veya Cümle</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 'kromozom' or 'Hücre zarının yapısı ve işlevleri nelerdir?'"
                  className="min-h-[120px] resize-none text-base p-4 rounded-lg shadow-sm"
                  {...field}
                  onKeyDown={handleTextareaKeyDown}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold">Açıklama Detayı</FormLabel>
              <div className="flex items-center space-x-4">
                <Label htmlFor="explanation-mode-switch" className="font-normal">
                  Basit
                </Label>
                <FormControl>
                  <Switch
                    id="explanation-mode-switch"
                    checked={field.value === 'Advanced'}
                    onCheckedChange={(checked) => field.onChange(checked ? 'Advanced' : 'Beginner')}
                    aria-label="Açıklama detay modu"
                    className="data-[state=unchecked]:bg-muted/50"
                    disabled={isLoading}
                  />
                </FormControl>
                <Label htmlFor="explanation-mode-switch" className="font-normal">
                  Detaylı
                </Label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full sm:w-auto text-lg py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:scale-[1.03]" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              İşleniyor...
            </>
          ) : (
            'Çevir & Açıkla'
          )}
        </Button>
      </form>
    </Form>
  );
}
