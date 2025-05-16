
'use server';
/**
 * @fileOverview Solves a biology question from an image using a multimodal AI model.
 *
 * - solveImageQuestion - A function that takes an image of a biology question and returns its transcription, solution, and explanation.
 * - SolveImageQuestionInput - The input type for the solveImageQuestion function.
 * - SolveImageQuestionOutput - The return type for the solveImageQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveImageQuestionInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a biology question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SolveImageQuestionInput = z.infer<typeof SolveImageQuestionInputSchema>;

const SolveImageQuestionOutputSchema = z.object({
  questionText: z.string().optional().describe('The transcribed text of the question from the image. May be omitted if transcription is not confident.'),
  solution: z.string().describe('The solution to the biology question.'),
  explanation: z.string().describe('A step-by-step explanation of the solution in Turkish.'),
  isBiologyQuestion: z.boolean().describe('Indicates if the image was identified as containing a biology question.'),
});
export type SolveImageQuestionOutput = z.infer<typeof SolveImageQuestionOutputSchema>;

export async function solveImageQuestion(input: SolveImageQuestionInput): Promise<SolveImageQuestionOutput> {
  return solveImageQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveImageQuestionPrompt',
  input: {schema: SolveImageQuestionInputSchema},
  output: {schema: SolveImageQuestionOutputSchema},
  prompt: `You are an expert Turkish high school biology teacher and tutor. Your task is to analyze an image containing a biology question, provide the solution, and explain it clearly.

Follow these steps:
1.  **Analyze the Image**: Carefully examine the provided image: {{media url=imageDataUri}}
2.  **Identify as Biology Question**: Determine if the image contains a discernible biology question suitable for a high school level. Set 'isBiologyQuestion' to true if it is, false otherwise. If it's not a biology question or is completely unreadable, set 'isBiologyQuestion' to false, and for 'solution' and 'explanation', state that a biology question could not be identified or processed.
3.  **Transcribe the Question (Optional but Recommended)**: If 'isBiologyQuestion' is true, attempt to accurately transcribe the main question text from the image. This is for the 'questionText' field. If transcription is difficult or you are not confident, you may omit this field or state that the text is unclear.
4.  **Solve the Question**: If 'isBiologyQuestion' is true, solve the biology question.
5.  **Provide Explanation**: If 'isBiologyQuestion' is true, provide a clear, step-by-step explanation of the solution in TURKISH. The explanation should be easy for a high school student to understand.
6.  **Language**: All textual output (solution, explanation, and transcribed question if provided) MUST be in Turkish.

Output Example (if a biology question is identified):
{
  "isBiologyQuestion": true,
  "questionText": "Hücre zarının görevleri nelerdir?",
  "solution": "Hücre zarının temel görevleri şunlardır: madde alışverişini kontrol etmek, hücreye şekil vermek, hücreyi dış etkenlerden korumak ve hücreler arası iletişimi sağlamak.",
  "explanation": "Hücre zarı, seçici geçirgen bir yapıya sahiptir. Bu sayede hücreye girecek ve çıkacak maddeleri kontrol eder (madde alışverişi). Aynı zamanda hücreye desteklik sağlar ve ona belirli bir şekil kazandırır. Dış ortamla hücre içi ortam arasında bir bariyer oluşturarak hücreyi korur. Üzerindeki reseptörler sayesinde diğer hücrelerle veya çevresiyle iletişim kurabilir."
}

Output Example (if not a biology question or unreadable):
{
  "isBiologyQuestion": false,
  "questionText": "Görüntü net değil veya bir biyoloji sorusu içermiyor.",
  "solution": "Görüntüden bir biyoloji sorusu anlaşılamadı.",
  "explanation": "Lütfen net bir biyoloji sorusu içeren bir görüntü yükleyin."
}

Ensure your output strictly adheres to the 'SolveImageQuestionOutputSchema'.
`,
});

const solveImageQuestionFlow = ai.defineFlow(
  {
    name: 'solveImageQuestionFlow',
    inputSchema: SolveImageQuestionInputSchema,
    outputSchema: SolveImageQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI model did not return the expected output for solving the image question.');
    }
    return output;
  }
);
