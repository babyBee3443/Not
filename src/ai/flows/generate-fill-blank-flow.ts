
'use server';
/**
 * @fileOverview Generates fill-in-the-blank biology exercises in Turkish.
 *
 * - generateFillBlankExercise - A function to generate a fill-in-the-blank exercise.
 * - GenerateFillBlankInput - The input type for the function.
 * - GenerateFillBlankOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFillBlankInputSchema = z.object({
  topic: z.string().describe('The biology topic for the exercise (e.g., "Hücre Zarı", "Fotosentez").'),
  gradeLevel: z.enum(['9', '10', '11', '12']).describe("The student's grade level (9th, 10th, 11th, or 12th grade)."),
});
export type GenerateFillBlankInput = z.infer<typeof GenerateFillBlankInputSchema>;

const GenerateFillBlankOutputSchema = z.object({
  exerciseSentence: z.string().describe('A sentence in Turkish with a key term replaced by "__BLANK__". The sentence should be suitable for the given topic and grade level.'),
  correctAnswer: z.string().describe('The correct Turkish biological term that fits into the blank.'),
  options: z.array(z.string()).min(3).max(4).describe('An array of 3 to 4 options in Turkish, including the correctAnswer and 2-3 plausible distractors.'),
});
export type GenerateFillBlankOutput = z.infer<typeof GenerateFillBlankOutputSchema>;

export async function generateFillBlankExercise(input: GenerateFillBlankInput): Promise<GenerateFillBlankOutput> {
  return generateFillBlankFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFillBlankPrompt',
  input: {schema: GenerateFillBlankInputSchema},
  output: {schema: GenerateFillBlankOutputSchema},
  prompt: `
You are an expert Turkish high school biology teacher. Your task is to create a fill-in-the-blank exercise in TURKISH based on the provided topic and grade level.

Student's Request:
Topic: {{{topic}}}
Grade Level: {{{gradeLevel}}}

Instructions:
1.  **Create a Sentence**: Formulate a clear, concise, and factually accurate sentence in Turkish related to the given 'topic' and appropriate for the 'gradeLevel'. This sentence must highlight a key biological term.
2.  **Create a Blank**: In this sentence, replace the key biological term with the placeholder "__BLANK__". The term chosen for the blank should be significant and test understanding.
3.  **Provide the Correct Answer**: Identify the exact Turkish biological term that was replaced by "__BLANK__". This is the 'correctAnswer'.
4.  **Provide Options**: Create 3 to 4 multiple-choice options.
    *   One of these options MUST be the 'correctAnswer'.
    *   The other options should be plausible distractors – terms that are related to the topic or sound similar, but are incorrect in the context of the sentence.
    *   All options, including the correct answer, must be in Turkish.
5.  **Curriculum Adherence**: Ensure the content is accurate and aligns with the Turkish Ministry of National Education (MEB) high school biology curriculum for the specified 'gradeLevel'.

Example Output Structure (for a different topic):
Topic: Sindirim Sistemi
Grade Level: 10
Output:
{
  "exerciseSentence": "İnce bağırsakta proteinlerin kimyasal sindirimini başlatan enzim __BLANK__ enzimidir.",
  "correctAnswer": "pepsin",
  "options": ["pepsin", "amilaz", "lipaz", "tripsin"]
}

Ensure your output strictly adheres to the schema: 'exerciseSentence', 'correctAnswer', and 'options'.
`,
});

const generateFillBlankFlow = ai.defineFlow(
  {
    name: 'generateFillBlankFlow',
    inputSchema: GenerateFillBlankInputSchema,
    outputSchema: GenerateFillBlankOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate fill-in-the-blank exercise. The AI model did not return the expected output.');
    }
    return output;
  }
);
