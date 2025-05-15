"use client";

import * as React from 'react'; // Added this line
import type { Control } from 'react-hook-form';
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

  // Update defaultValues if they change (e.g. from history selection)
  React.useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8"> {/* Increased spacing */}
        <FormField
          control={form.control}
          name="turkishInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Turkish Term or Sentence</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 'kromozom' or 'Hücre zarının yapısı ve işlevleri nelerdir?'"
                  className="min-h-[120px] resize-none text-base p-4 rounded-lg shadow-sm" // Added padding, rounded, shadow
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
              <div className="flex items-center space-x-4">
                <Label htmlFor="explanation-mode-switch" className="font-normal text-muted-foreground">
                  Simple
                </Label>
                <FormControl>
                  <Switch
                    id="explanation-mode-switch"
                    checked={field.value === 'Advanced'}
                    onCheckedChange={(checked) => field.onChange(checked ? 'Advanced' : 'Beginner')}
                    aria-label="Explanation detail mode"
                  />
                </FormControl>
                <Label htmlFor="explanation-mode-switch" className="font-normal text-muted-foreground">
                  Detailed
                </Label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full sm:w-auto text-lg py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" // Enhanced styling
          disabled={isLoading}
        >
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
