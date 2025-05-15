"use client";

import type { Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { ExplanationMode } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  turkishInput: z.string().min(1, { message: 'Please enter some text.' }).max(500, { message: 'Input cannot exceed 500 characters.' }),
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="turkishInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Turkish Term or Sentence</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 'kromozom' or 'Hücre zarının yapısı ve işlevleri nelerdir?'"
                  className="min-h-[120px] resize-none text-base"
                  {...field}
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
              <FormLabel className="text-lg font-semibold">Explanation Detail</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Beginner" />
                    </FormControl>
                    <FormLabel className="font-normal">Simple</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Advanced" />
                    </FormControl>
                    <FormLabel className="font-normal">Detailed</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full sm:w-auto text-base py-3 px-6" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            'Translate & Explain'
          )}
        </Button>
      </form>
    </Form>
  );
}
