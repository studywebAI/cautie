import { config } from 'dotenv';
config();

import '@/ai/flows/generate-personalized-study-plan.ts';
import '@/ai/flows/generate-initial-answer.ts';
import '@/ai/flows/provide-ai-powered-analytics-student.ts';
import '@/ai/flows/provide-ai-powered-analytics-teacher.ts';
import '@/ai/flows/generate-dashboard-data.ts';
