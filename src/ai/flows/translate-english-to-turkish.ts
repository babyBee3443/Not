// src/ai/flows/translate-english-to-turkish.ts
'use server';

/**
 * @fileOverview Implements the English to Turkish sentence translation flow.
 *
 * - translateEnglishToTurkish - A function that translates an English sentence into Turkish.
 * - TranslateEnglishToTurkishInput - The input type for the translateEnglishToTurkish function.
 * - TranslateEnglishToTurkishOutput - The return type for the translateEnglishToTurkish function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateEnglishToTurkishInputSchema = z.object({
  englishText: z
    .string()
    .describe('The English text to be translated into Turkish.'),
});
export type TranslateEnglishToTurkishInput = z.infer<typeof TranslateEnglishToTurkishInputSchema>;

const TranslateEnglishToTurkishOutputSchema = z.object({
  turkishText: z
    .string()
    .describe('The Turkish translation of the input English text.'),
});
export type TranslateEnglishToTurkishOutput = z.infer<typeof TranslateEnglishToTurkishOutputSchema>;

export async function translateEnglishToTurkish(input: TranslateEnglishToTurkishInput): Promise<TranslateEnglishToTurkishOutput> {
  return translateEnglishToTurkishFlow(input);
}

const translateEnglishToTurkishPrompt = ai.definePrompt({
  name: 'translateEnglishToTurkishPrompt',
  input: {schema: TranslateEnglishToTurkishInputSchema},
  output: {schema: TranslateEnglishToTurkishOutputSchema},
  prompt: `Translate the following English text into grammatically correct Turkish.

English Text: {{{englishText}}}

Turkish Translation:`,
});

const translateEnglishToTurkishFlow = ai.defineFlow(
  {
    name: 'translateEnglishToTurkishFlow',
    inputSchema: TranslateEnglishToTurkishInputSchema,
    outputSchema: TranslateEnglishToTurkishOutputSchema,
  },
  async input => {
    const {output} = await translateEnglishToTurkishPrompt(input);
    return output!;
  }
);
