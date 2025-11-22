'use server';
/**
 * @fileOverview An AI agent that generates all data for the student dashboard.
 *
 * - generateDashboardData - A function that returns tasks, alerts, deadlines, subjects, AI suggestions, and progress data.
 * - GenerateDashboardDataInput - The input type for the generateDashboardData function.
 * - GenerateDashboardDataOutput - The return type for the generateDashboardData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string().describe('Unique identifier for the task.'),
  title: z.string().describe('The title of the task.'),
  duration: z.number().describe('The estimated duration in minutes.'),
  completed: z.boolean().describe('Whether the task is completed.'),
});

const AlertSchema = z.object({
  id: z.string().describe('Unique identifier for the alert.'),
  title: z.string().describe('The title of the alert.'),
  description: z.string().describe('A brief description of the alert.'),
  variant: z
    .enum(['destructive', 'warning', 'info', 'success'])
    .describe('The visual variant of the alert.'),
  icon: z
    .enum(['AlertTriangle', 'Info', 'CheckCircle2'])
    .describe('The icon to display with the alert.'),
});

const DeadlineSchema = z.object({
  id: z.string().describe('Unique identifier for the deadline.'),
  subject: z.string().describe('The subject the deadline belongs to.'),
  title: z.string().describe('The title of the deadline item (e.g., exam, assignment).'),
  date: z.string().describe('The due date of the deadline, in a human-readable format (e.g., "Morgen", "Over 4 dagen").'),
  workload: z.string().describe('The estimated workload remaining.'),
  status: z
    .enum(['on-track', 'risk', 'behind'])
    .describe('The current status of the deadline.'),
});

const SubjectSchema = z.object({
  id: z.string().describe('Unique identifier for the subject.'),
  name: z.string().describe('The name of the subject.'),
  progress: z.number().describe('The student\'s progress in the subject, as a percentage.'),
  imageUrl: z.string().url().describe('A URL for an image representing the subject.'),
  imageHint: z.string().describe('A two-word hint for the subject image (e.g., "history map").'),
});

const AiSuggestionSchema = z.object({
  id: z.string().describe('Unique identifier for the suggestion.'),
  title: z.string().describe('The AI-generated suggestion.'),
  icon: z.enum(['BrainCircuit', 'FileText', 'Calendar']).describe('The icon for the suggestion.'),
});

const QuickAccessItemSchema = z.object({
    id: z.string().describe('Unique identifier for the quick access item.'),
    title: z.string().describe('The title of the item.'),
    type: z.enum(['summary', 'quiz', 'file', 'notes']).describe('The type of item.'),
    icon: z.enum(['Notebook', 'File', 'BrainCircuit', 'FileText']).describe('The icon for the item.'),
});

const ProgressDataSchema = z.object({
    day: z.string().describe('The day of the week (e.g., "Ma", "Di").'),
    'Study Time': z.number().describe('The study time in minutes for that day.'),
});


const GenerateDashboardDataInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  subjects: z.array(z.string()).describe('A list of subjects the student is taking.'),
});
export type GenerateDashboardDataInput = z.infer<
  typeof GenerateDashboardDataInputSchema
>;

const GenerateDashboardDataOutputSchema = z.object({
  tasks: z.array(TaskSchema).describe('A list of tasks for the student\'s daily plan.'),
  alerts: z.array(AlertSchema).describe('A list of important alerts for the student.'),
  deadlines: z.array(DeadlineSchema).describe('A list of upcoming deadlines.'),
  subjects: z.array(SubjectSchema).describe('A list of the student\'s subjects with progress.'),
  aiSuggestions: z.array(AiSuggestionSchema).describe('A list of AI-powered suggestions.'),
  quickAccessItems: z.array(QuickAccessItemSchema).describe('A list of recent items for quick access.'),
  progressData: z.array(ProgressDataSchema).describe('Weekly progress data for the study time chart.'),
});
export type GenerateDashboardDataOutput = z.infer<
  typeof GenerateDashboardDataOutputSchema
>;

export async function generateDashboardData(
  input: GenerateDashboardDataInput
): Promise<GenerateDashboardDataOutput> {
  return generateDashboardDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDashboardDataPrompt',
  input: {schema: GenerateDashboardDataInputSchema},
  output: {schema: GenerateDashboardDataOutputSchema},
  prompt: `You are an AI assistant for a student named {{{studentName}}}. You need to generate a realistic and coherent set of data for their study dashboard. The student is currently taking the following subjects: {{{subjects}}}.

Generate the following data:
1.  **Tasks**: 4-5 realistic study tasks for today. Some should be completed.
2.  **Alerts**: 2-3 important and varied alerts (e.g., one urgent, one informational).
3.  **Deadlines**: 3-4 upcoming deadlines with varied subjects, dates, and statuses.
4.  **Subjects**: Data for each of the student's subjects, including a realistic progress percentage and an unsplash URL for a relevant image. The image URL should be in the format 'https://picsum.photos/seed/{a-word}/{width}/{height}'.
5.  **AI Suggestions**: 3 actionable and helpful suggestions for the student.
6.  **Quick Access**: 4 varied quick access items representing recent notes, files, or quizzes.
7.  **Progress Data**: A list of 7 items representing study time for each day of the week (Ma, Di, Wo, Do, Vr, Za, Zo).

Ensure all generated data is in Dutch. All IDs should be unique strings.
Make the data interconnected and logical. For example, a deadline for a subject should have related tasks. An alert could be about a deadline.
`,
});

const generateDashboardDataFlow = ai.defineFlow(
  {
    name: 'generateDashboardDataFlow',
    inputSchema: GenerateDashboardDataInputSchema,
    outputSchema: GenerateDashboardDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
