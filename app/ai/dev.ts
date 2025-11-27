'use server';
import { config } from 'dotenv';
config();

import 'lib/ai/flows/generate-personalized-study-plan.ts';
import 'lib/ai/flows/provide-ai-powered-analytics-student.ts';
import 'lib/ai/flows/provide-ai-powered-analytics-teacher.ts';
import 'lib/ai/flows/process-material.ts';
import 'lib/ai/flows/generate-flashcards.ts';
import 'lib/ai/flows/generate-quiz.ts';
import 'lib/ai/flows/explain-answer.ts';
import 'lib/ai/flows/generate-single-question.ts';
import 'lib/ai/flows/generate-class-ideas.ts';
import 'lib/ai/flows/generate-quiz-duel-data.ts';
import 'lib/ai/flows/generate-single-flashcard.ts';
import 'lib/ai/flows/generate-multiple-choice-from-flashcard.ts';
import 'lib/ai/flows/generate-notes.ts';
import 'lib/ai/flows/generate-knowledge-graph.ts';
import 'lib/ai/flows/generate-study-plan-from-task.ts';
