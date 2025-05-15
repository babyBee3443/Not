'use server';

/**
 * @fileOverview Explains a biological term in English at an academic level, with adjustable detail.
 *
 * - explainTerm - A function that provides an academic explanation of a biological term.
 * - ExplainTermInput - The input type for the explainTerm function.
 * - ExplainTermOutput - The return type for the explainTerm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainTermInputSchema = z.object({
  term: z.string().describe('The biological term to explain (in Turkish).'),
  mode: z
    .enum(['Beginner', 'Advanced'])
    .describe('The level of detail for the explanation.'),
});
export type ExplainTermInput = z.infer<typeof ExplainTermInputSchema>;

const ExplainTermOutputSchema = z.object({
  englishTerm: z.string().describe('The English translation of the term.'),
  explanation: z.string().describe('A detailed, academic-level explanation of the term in English.'),
});
export type ExplainTermOutput = z.infer<typeof ExplainTermOutputSchema>;

export async function explainTerm(input: ExplainTermInput): Promise<ExplainTermOutput> {
  return explainTermFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainTermPrompt',
  input: {schema: ExplainTermInputSchema},
  output: {schema: ExplainTermOutputSchema},
  prompt: `You are an expert biology educator.

You will receive a biological term in Turkish, translate it to English and provide a detailed, academic-level explanation of the term in English.
Adjust the level of detail based on the user's selected mode: Beginner or Advanced.

Turkish Term: {{{term}}}
Mode: {{{mode}}}

Your Explanation (in English, academic level):
`, // Ensure output is structured as requested
});

const explainTermFlow = ai.defineFlow(
  {
    name: 'explainTermFlow',
    inputSchema: ExplainTermInputSchema,
    outputSchema: ExplainTermOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
