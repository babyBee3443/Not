
'use server';
/**
 * @fileOverview Generates biology tests in Turkish, acting as a knowledgeable high school biology teacher.
 *
 * - generateBiologyTest - A function to generate biology tests based on topic, grade level, difficulty, and number of questions.
 * - GenerateBiologyTestInput - The input type for the generateBiologyTest function.
 * - GenerateBiologyTestOutput - The return type for the generateBiologyTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionItemSchema = z.object({
  questionText: z.string().describe('The text of the multiple-choice question, in Turkish.'),
  options: z.array(z.string()).length(4).describe('Four possible answer options for the question, in Turkish.'),
  correctAnswerIndex: z.number().min(0).max(3).describe('The 0-based index of the correct answer in the options array.'),
  explanation: z.string().describe('A brief explanation for why the correct answer is right, in Turkish.'),
});

const GenerateBiologyTestInputSchema = z.object({
  topic: z.string().describe('The biology topic for which the test is to be generated (e.g., "Hücre Zarı ve Madde Geçişleri", "Mitoz ve Mayoz Bölünme").'),
  gradeLevel: z.enum(['9', '10', '11', '12']).describe("The student's grade level (9th, 10th, 11th, or 12th grade) to tailor the content to the Turkish high school biology curriculum."),
  difficultyLevel: z.enum(['Kolay', 'Orta', 'Zor']).default('Orta').describe('The desired difficulty level for the test questions ("Kolay", "Orta", "Zor").'),
  numberOfQuestions: z.number().min(1).max(10).default(5).describe('The number of questions to generate for the test (e.g., 5, 10). Maximum 10.'),
});
export type GenerateBiologyTestInput = z.infer<typeof GenerateBiologyTestInputSchema>;

const GenerateBiologyTestOutputSchema = z.object({
  testTitle: z.string().describe('A suitable title for the generated biology test, in Turkish.'),
  questions: z.array(QuestionItemSchema).describe('A list of generated biology questions based on the input criteria.'),
});
export type GenerateBiologyTestOutput = z.infer<typeof GenerateBiologyTestOutputSchema>;

export async function generateBiologyTest(input: GenerateBiologyTestInput): Promise<GenerateBiologyTestOutput> {
  return generateBiologyTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBiologyTestPrompt',
  input: {schema: GenerateBiologyTestInputSchema},
  output: {schema: GenerateBiologyTestOutputSchema},
  prompt: `
You are a highly experienced and meticulous Turkish high school biology teacher, an expert in crafting effective assessment materials. You are deeply familiar with the Turkish Ministry of National Education (MEB) high school biology curriculum for all grades (9-12), including the official 'Maarif' textbooks and any annual updates (referencing resources like mufredat.meb.gov.tr).

Your task is to generate a biology test in TURKISH based on the student's request.

Here are your guidelines:
1.  **Curriculum Adherence**: All questions must be accurate and strictly align with the MEB curriculum for the specified 'gradeLevel' and 'topic'.
2.  **Difficulty Level ('difficultyLevel')**:
    *   'Kolay': Focus on recall of basic facts, definitions, and direct comprehension.
    *   'Orta': Require understanding, interpretation, and application of concepts. May involve simple analysis.
    *   'Zor': Demand analysis, synthesis, evaluation, or solving multi-step problems. Questions may require connecting multiple concepts.
3.  **Number of Questions ('numberOfQuestions')**: Generate exactly the specified number of questions.
4.  **Question Structure (for each question in the 'questions' array)**:
    *   'questionText': Clear, unambiguous question in Turkish.
    *   'options': Four distinct multiple-choice options in Turkish. One option must be clearly correct, and the others should be plausible distractors.
    *   'correctAnswerIndex': The 0-based index of the correct option.
    *   'explanation': A concise explanation in Turkish detailing why the correct answer is right and, if helpful, why common distractors might be wrong.
5.  **Test Title ('testTitle')**: Create an appropriate and descriptive title for the test in Turkish.
6.  **Language**: All output MUST be in Turkish.

Student's Request:
Topic: {{{topic}}}
Grade Level: {{{gradeLevel}}}
Difficulty Level: {{{difficultyLevel}}}
Number of Questions: {{{numberOfQuestions}}}

Please generate the test strictly according to the output schema. Ensure all questions are unique and test different aspects of the topic where possible.
`,
});

const generateBiologyTestFlow = ai.defineFlow(
  {
    name: 'generateBiologyTestFlow',
    inputSchema: GenerateBiologyTestInputSchema,
    outputSchema: GenerateBiologyTestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate biology test. The AI model did not return the expected output.');
    }
    return output;
  }
);

