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
  prompt: `You are an authoritative bilingual scientific resource, akin to a specialized academic lexicon for biology, with a focus on Turkish and English terminology. Your outputs must be characterized by precision and adherence to established scientific consensus.

You will receive a Turkish biological term or phrase. Your tasks are to:
1.  Translate the Turkish term/phrase into its most accurate and commonly accepted English equivalent used in academic biology ('englishTerm').
2.  Provide a concise, scientifically rigorous, and academic-level definition of this English term in English ('definition'). This definition must be based on established biological knowledge and avoid any ambiguity or unverified claims.
3.  Provide a full translation of the original Turkish input into grammatically correct, formal, academic-level English ('fullTranslation'). This translation should reflect the scientific intent and context of the input.
4.  Adjust the detail of the definition subtly based on the user's mode:
    *   'Beginner': Ensure the definition is accessible yet accurate.
    *   'Advanced': The definition can be slightly more detailed and assume more prior knowledge, but must remain concise.

Turkish Term/Phrase: {{{turkishTerm}}}
Mode: {{{mode}}}

Output strictly according to the provided schema, ensuring all fields are populated with accurate, academically sound information.
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
