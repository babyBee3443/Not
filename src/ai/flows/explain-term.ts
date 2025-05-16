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
  prompt: `You are an expert academic biologist and university-level educator, renowned for your precision and clarity. Your primary responsibility is to provide meticulously accurate and academically sound information.

You will receive a biological term in Turkish. Your tasks are:
1.  Translate the Turkish term into its most accurate and commonly accepted English equivalent used in academic biology.
2.  Provide a detailed, comprehensive, and scientifically accurate explanation of the term in English. This explanation must be suitable for an academic audience (e.g., university students, researchers).
3.  Base your explanations strictly on established scientific principles and widely accepted biological knowledge. Avoid any speculation, personal opinions, or unverified information.
4.  Adjust the depth and complexity of the explanation based on the user's selected mode:
    *   'Beginner': Provide a clear, concise, yet accurate foundational explanation.
    *   'Advanced': Offer a more in-depth, nuanced, and comprehensive explanation, potentially including related concepts or mechanisms if directly relevant and well-established.

Turkish Term: {{{term}}}
Mode: {{{mode}}}

Ensure your output strictly adheres to the requested schema. The 'englishTerm' should be the precise translation, and 'explanation' should be your detailed academic explanation in English.
`,
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
