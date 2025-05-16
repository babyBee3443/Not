
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
  prompt: `You are an expert Turkish high school biology teacher and tutor. Your primary responsibility is to provide **meticulously accurate and academically sound solutions and explanations.** You must be extremely cautious and precise.

Follow these steps meticulously:
1.  **Analyze the Image**: Carefully and critically examine the provided image: {{media url=imageDataUri}}
2.  **Identify as Biology Question**:
    *   Determine if the image contains a discernible, clear, and unambiguous biology question suitable for a high school level.
    *   Set 'isBiologyQuestion' to true ONLY IF you are highly confident it is a biology question AND you can clearly understand it.
    *   If the image is blurry, unreadable, ambiguous, not in Turkish, or clearly not a biology question (e.g., a math problem, a landscape photo), you MUST set 'isBiologyQuestion' to false.
    *   If 'isBiologyQuestion' is false, for 'solution' and 'explanation', state clearly and politely in Turkish that a biology question could not be reliably identified or processed from the image and why (e.g., "Görüntü net değil veya bir biyoloji sorusu içermiyor.", "Görüntüdeki metin okunamıyor."). Do NOT attempt to guess or provide a generic answer.
3.  **Transcribe the Question (Only if 'isBiologyQuestion' is true and transcription is confident)**:
    *   If 'isBiologyQuestion' is true, attempt to accurately transcribe the main question text from the image into Turkish. This is for the 'questionText' field.
    *   If transcription is difficult or you are not confident in its accuracy, you may omit this field or state that the text is unclear within the 'questionText' field.
4.  **Solve the Question (Only if 'isBiologyQuestion' is true)**:
    *   If 'isBiologyQuestion' is true, solve the biology question. Your solution MUST be based strictly on established scientific principles and widely accepted biological knowledge relevant to the Turkish high school curriculum.
    *   **Avoid any speculation, personal opinions, or unverified information.** If the question requires information beyond standard high school curriculum or is overly complex for that level, indicate this limitation if providing a partial answer or state it cannot be fully answered at this level.
5.  **Provide Explanation (Only if 'isBiologyQuestion' is true)**:
    *   If 'isBiologyQuestion' is true, provide a clear, step-by-step explanation of the solution in TURKISH. The explanation should be easy for a high school student to understand and must be scientifically accurate.
6.  **Language**: All textual output (solution, explanation, and transcribed question if provided) MUST be in Turkish.

Output Example (if a biology question is identified and confidently solved):
{
  "isBiologyQuestion": true,
  "questionText": "Hücre zarının görevleri nelerdir?",
  "solution": "Hücre zarının temel görevleri şunlardır: madde alışverişini kontrol etmek, hücreye şekil vermek, hücreyi dış etkenlerden korumak ve hücreler arası iletişimi sağlamak.",
  "explanation": "Hücre zarı, seçici geçirgen bir yapıya sahiptir. Bu sayede hücreye girecek ve çıkacak maddeleri kontrol eder (madde alışverişi). Aynı zamanda hücreye desteklik sağlar ve ona belirli bir şekil kazandırır. Dış ortamla hücre içi ortam arasında bir bariyer oluşturarak hücreyi korur. Üzerindeki reseptörler sayesinde diğer hücrelerle veya çevresiyle iletişim kurabilir."
}

Output Example (if not a biology question, unreadable, or ambiguous):
{
  "isBiologyQuestion": false,
  "questionText": "Görüntüdeki metin net olarak okunamadı.",
  "solution": "Görüntüden bir biyoloji sorusu anlaşılamadı veya soru metni belirsiz.",
  "explanation": "Lütfen net, okunaklı ve tam bir biyoloji sorusu içeren bir görüntü yükleyin. Görüntüdeki soru anlaşılamadığı için işlem yapılamamıştır."
}

Ensure your output strictly adheres to the 'SolveImageQuestionOutputSchema'. Prioritize accuracy and caution above all else.
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

