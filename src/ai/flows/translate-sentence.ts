// This is an auto-generated file from Firebase Studio.
'use server';

/**
 * @fileOverview Implements the sentence translation flow.
 *
 * - translateSentence - A function that translates a Turkish sentence into academic English.
 * - TranslateSentenceInput - The input type for the translateSentence function.
 * - TranslateSentenceOutput - The return type for the translateSentence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateSentenceInputSchema = z.object({
  turkishSentence: z
    .string()
    .describe('The Turkish sentence to be translated into academic English.'),
});
export type TranslateSentenceInput = z.infer<typeof TranslateSentenceInputSchema>;

const TranslateSentenceOutputSchema = z.object({
  englishSentence: z
    .string()
    .describe('The grammatically correct, academic-level English translation of the input sentence.'),
});
export type TranslateSentenceOutput = z.infer<typeof TranslateSentenceOutputSchema>;

export async function translateSentence(input: TranslateSentenceInput): Promise<TranslateSentenceOutput> {
  return translateSentenceFlow(input);
}

const translateSentencePrompt = ai.definePrompt({
  name: 'translateSentencePrompt',
  input: {schema: TranslateSentenceInputSchema},
  output: {schema: TranslateSentenceOutputSchema},
  prompt: `Translate the following Turkish sentence into grammatically correct, academic-level English.

Turkish Sentence: {{{turkishSentence}}}`,
});

const translateSentenceFlow = ai.defineFlow(
  {
    name: 'translateSentenceFlow',
    inputSchema: TranslateSentenceInputSchema,
    outputSchema: TranslateSentenceOutputSchema,
  },
  async input => {
    const {output} = await translateSentencePrompt(input);
    return output!;
  }
);
