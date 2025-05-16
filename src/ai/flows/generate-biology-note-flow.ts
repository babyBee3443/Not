
'use server';
/**
 * @fileOverview Generates biology notes in Turkish, acting as a knowledgeable and engaging high school biology teacher.
 *
 * - generateBiologyNote - A function to generate biology notes based on a topic, grade level, and desired tone.
 * - GenerateBiologyNoteInput - The input type for the generateBiologyNote function.
 * - GenerateBiologyNoteOutput - The return type for the generateBiologyNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBiologyNoteInputSchema = z.object({
  topic: z.string().describe('The biology topic for which the note is to be generated (e.g., "Hücre Organelleri", "Fotosentez").'),
  gradeLevel: z.enum(['9', '10', '11', '12']).describe("The student's grade level (9th, 10th, 11th, or 12th grade) to tailor the content to the Turkish high school biology curriculum."),
  tone: z.enum(['Standard', 'Humorous', 'Engaging']).default('Engaging').describe('The desired tone for the note (e.g., "Standard", "Humorous", "Engaging").'),
});
export type GenerateBiologyNoteInput = z.infer<typeof GenerateBiologyNoteInputSchema>;

const GenerateBiologyNoteOutputSchema = z.object({
  title: z.string().describe('A catchy and relevant title for the biology note in Turkish.'),
  content: z.string().describe('The main content of the biology note in Turkish. It should be engaging, easy to understand, and suitable for the specified grade level. It should reflect the persona of a fun and knowledgeable biology teacher.'),
  keyConcepts: z.array(z.string()).describe('A list of key concepts or terms related to the topic, in Turkish.'),
  interestingFact: z.string().describe('An interesting and engaging fact related to the topic, in Turkish.'),
  web2ToolSuggestion: z.object({
    name: z.string().describe('Name of a relevant Web 2.0 tool.'),
    description: z.string().describe('A brief description of how the tool can be used for the topic, in Turkish.'),
    url: z.string().optional().describe('URL of the Web 2.0 tool, if available. This should be a valid web address starting with http:// or https://.'),
  }).optional().describe('A suggestion for a Web 2.0 tool that can be used to learn more about the topic. This should be a real and useful tool.'),
  summaryQuiz: z.object({
    question: z.string().describe('A short multiple-choice question in Turkish to summarize or check understanding of the topic.'),
    options: z.array(z.string()).length(4).describe('Four possible answers for the quiz question, in Turkish.'),
    correctAnswerIndex: z.number().min(0).max(3).describe('The 0-based index of the correct answer in the options array.'),
    explanation: z.string().describe('A brief explanation for the correct answer, in Turkish.'),
  }).describe('A simple multiple-choice quiz question to help reinforce learning.'),
});
export type GenerateBiologyNoteOutput = z.infer<typeof GenerateBiologyNoteOutputSchema>;

export async function generateBiologyNote(input: GenerateBiologyNoteInput): Promise<GenerateBiologyNoteOutput> {
  return generateBiologyNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBiologyNotePrompt',
  input: {schema: GenerateBiologyNoteInputSchema},
  output: {schema: GenerateBiologyNoteOutputSchema},
  prompt: `
You are a highly experienced and enthusiastic Turkish high school biology teacher. Your students love your classes because you make biology fun, engaging, and easy to understand. You are an expert in the Turkish high school biology curriculum for all grades (9-12) and stay up-to-date with the latest biological discoveries and Web 2.0 educational tools.

Your task is to generate a study note for a student based on the topic they provide. The note should be in TURKISH.

Here are your guidelines:
1.  **Persona**: Maintain a friendly, approachable, and slightly humorous tone (if 'Humorous' or 'Engaging' tone is selected). Be like a cool, knowledgeable teacher.
2.  **Curriculum Adherence**: Ensure the content is accurate and appropriate for the specified 'gradeLevel' according to the Turkish Ministry of National Education (MEB) high school biology curriculum.
3.  **Content (content)**:
    *   Explain the 'topic' clearly and fluently. Use simple language where possible, but don't shy away from academic terms if necessary (explain them if they are complex for the grade level).
    *   Break down complex ideas into digestible parts.
    *   Use analogies or real-world examples if they help in understanding.
4.  **Title (title)**: Create a catchy and relevant title for the note.
5.  **Key Concepts (keyConcepts)**: Identify and list 3-5 important key concepts or terms related to the topic.
6.  **Interesting Fact (interestingFact)**: Include a fascinating and relevant biological fact that would pique a student's interest.
7.  **Web 2.0 Tool Suggestion (web2ToolSuggestion)** (Optional but encouraged):
    *   If appropriate and useful for the topic, suggest a real Web 2.0 tool (like an interactive simulation website, a concept mapping tool, a biology-focused YouTube channel, etc.).
    *   Briefly explain how the student can use this tool to enhance their learning for the given 'topic'. Provide a name, description, and URL if possible. Ensure the URL is a valid web address starting with http:// or https://.
8.  **Summary Quiz (summaryQuiz)**:
    *   Create one multiple-choice question with four options to quickly test understanding of a core aspect of the topic.
    *   Clearly indicate the correct answer and provide a brief explanation for why it's correct.
9.  **Language**: All output MUST be in Turkish.

Student's Request:
Topic: {{{topic}}}
Grade Level: {{{gradeLevel}}}
Desired Tone: {{{tone}}}

Please generate the note according to the output schema. Make it informative, engaging, and helpful for a Turkish high school student.
`,
});

const generateBiologyNoteFlow = ai.defineFlow(
  {
    name: 'generateBiologyNoteFlow',
    inputSchema: GenerateBiologyNoteInputSchema,
    outputSchema: GenerateBiologyNoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate biology note. The AI model did not return the expected output.');
    }
    return output;
  }
);

