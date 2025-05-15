// src/ai/flows/translate-term.ts
'use server';

/**
 * @fileOverview Translates a Turkish biological term into English and provides an academic-level definition.
 *
 * - translateTerm - A function that translates and defines a biological term.
 * - TranslateTermInput - The input type for the translateTerm function.
 * - TranslateTermOutput - The return type for the translateTerm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTermInputSchema = z.object({
  turkishTerm: z.string().describe('The Turkish biological term to translate and define.'),
  mode: z.enum(['Beginner', 'Advanced']).default('Beginner').describe('The level of detail for the explanation.'),
});
export type TranslateTermInput = z.infer<typeof TranslateTermInputSchema>;

const TranslateTermOutputSchema = z.object({
  englishTerm: z.string().describe('The English translation of the biological term.'),
  definition: z.string().describe('A concise, academic-level definition of the term in English.'),
  fullTranslation: z.string().describe('The full input translated into academic English.'),
});
export type TranslateTermOutput = z.infer<typeof TranslateTermOutputSchema>;

export async function translateTerm(input: TranslateTermInput): Promise<TranslateTermOutput> {
  return translateTermFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTermPrompt',
  input: {schema: TranslateTermInputSchema},
  output: {schema: TranslateTermOutputSchema},
  prompt: `You are a bilingual scientific dictionary specializing in biology.

You will translate a Turkish biological term into English, provide a concise, academic-level definition in English, and translate the full Turkish input into grammatically correct, academic-level English.

The level of detail in the explanation should depend on the user mode. If the mode is Beginner, the explanation should be simpler. If the mode is Advanced, the explanation should be more detailed.

Turkish Term: {{{turkishTerm}}}
Mode: {{{mode}}}

Output the English translation, the definition, and the full translation, each on a new line.

Ensure that the definition and full translation are accurate and appropriate for academic use.

Follow the schema provided for the output.
`,
});

const translateTermFlow = ai.defineFlow(
  {
    name: 'translateTermFlow',
    inputSchema: TranslateTermInputSchema,
    outputSchema: TranslateTermOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
