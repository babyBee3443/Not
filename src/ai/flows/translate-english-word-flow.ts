'use server';
/**
 * @fileOverview Implements the English word to Turkish word translation flow.
 *
 * - translateEnglishWordToTurkish - A function that translates a single English word into Turkish.
 * - TranslateEnglishWordInput - The input type for the translateEnglishWordToTurkish function.
 * - TranslateEnglishWordOutput - The return type for the translateEnglishWordToTurkish function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateEnglishWordInputSchema = z.object({
  englishWord: z
    .string()
    .describe('The English word to be translated into Turkish.'),
});
export type TranslateEnglishWordInput = z.infer<typeof TranslateEnglishWordInputSchema>;

const TranslateEnglishWordOutputSchema = z.object({
  turkishWord: z
    .string()
    .describe('The Turkish translation of the input English word.'),
});
export type TranslateEnglishWordOutput = z.infer<typeof TranslateEnglishWordOutputSchema>;

export async function translateEnglishWordToTurkish(input: TranslateEnglishWordInput): Promise<TranslateEnglishWordOutput> {
  return translateEnglishWordFlow(input);
}

const translateEnglishWordPrompt = ai.definePrompt({
  name: 'translateEnglishWordPrompt',
  input: {schema: TranslateEnglishWordInputSchema},
  output: {schema: TranslateEnglishWordOutputSchema},
  prompt: `Translate the following English word into Turkish. Provide only the most common single-word translation.

English Word: {{{englishWord}}}

Turkish Translation:`,
});

const translateEnglishWordFlow = ai.defineFlow(
  {
    name: 'translateEnglishWordFlow',
    inputSchema: TranslateEnglishWordInputSchema,
    outputSchema: TranslateEnglishWordOutputSchema,
  },
  async input => {
    const {output} = await translateEnglishWordPrompt(input);
    return output!;
  }
);
