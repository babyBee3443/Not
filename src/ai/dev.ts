import { config } from 'dotenv';
config();

import '@/ai/flows/translate-sentence.ts';
import '@/ai/flows/explain-term.ts';
import '@/ai/flows/translate-term.ts';
import '@/ai/flows/translate-english-to-turkish.ts';
import '@/ai/flows/translate-english-word-flow.ts';
import '@/ai/flows/generate-biology-note-flow.ts';
import '@/ai/flows/generate-biology-test-flow.ts';

