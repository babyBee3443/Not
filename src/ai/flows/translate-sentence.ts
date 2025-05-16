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
  prompt: `You are a highly skilled scientific translator specializing in converting Turkish biological texts into precise, publication-quality academic English. Your translations must maintain the utmost scientific integrity and clarity.

Translate the following Turkish sentence into grammatically impeccable, formal, academic-level English.
The translation must:
1.  Be accurate and faithful to the scientific meaning of the original Turkish sentence.
2.  Use appropriate academic terminology and style.
3.  Be suitable for inclusion in scientific papers, textbooks, or academic presentations.
4.  Avoid colloquialisms or informal language.

Turkish Sentence: {{{turkishSentence}}}

Your output must be only the translated English sentence, adhering to the schema.`,
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
