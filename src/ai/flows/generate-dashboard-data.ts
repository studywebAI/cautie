'use server';
/**
 * @fileOverview An AI agent that generates all data for the student dashboard.
 *
 * - generateDashboardData - A function that returns tasks, alerts, and deadlines.
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
  date: z.string().describe('The due date of the deadline, in a human-readable format (e.g., "Tomorrow", "In 4 days").'),
  workload: z.string().describe('The estimated workload remaining.'),
  status: z
    .enum(['on-track', 'risk', 'behind'])
    .describe('The current status of the deadline.'),
});

const AiSuggestionSchema = z.object({
  id: z.string().describe('Unique identifier for the suggestion.'),
  title: z.string().describe('The AI-generated suggestion.'),
  icon: z.enum(['BrainCircuit', 'FileText', 'Calendar']).describe('The icon for the suggestion.'),
});

const SubjectSchema = z.object({
  id: z.string().describe('Unique identifier for the subject (e.g., "history").'),
  name: z.string().describe('The name of the subject (e.g., "History").'),
  progress: z.number().describe('The student\'s current progress in this subject, from 0 to 100.'),
});

const QuickAccessItemSchema = z.object({
  id: z.string().describe('Unique identifier for the quick access item.'),
  title: z.string().describe('The title of the item (e.g., "Industrial Revolution Quiz").'),
  type: z.enum(['summary', 'quiz', 'file', 'notes']).describe('The type of the material.'),
  icon: z.enum(['Notebook', 'File', 'BrainCircuit', 'FileText']).describe('The icon for the item.'),
});

const ProgressDataSchema = z.object({
  day: z.string().describe("The day of the week, as a three-letter abbreviation (e.g., 'Mon', 'Tue')."),
  'Study Time': z.number().describe('The total study time in minutes for that day.'),
});


const GenerateDashboardDataInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  subjects: z.array(z.string()).describe('A list of subject names the student is taking.'),
});
type GenerateDashboardDataInput = z.infer<
  typeof GenerateDashboardDataInputSchema
>;

const GenerateDashboardDataOutputSchema = z.object({
  tasks: z.array(TaskSchema).describe('A list of tasks for the student\'s daily plan.'),
  alerts: z.array(AlertSchema).describe('A list of important alerts for the student.'),
  deadlines: z.array(DeadlineSchema).describe('A list of upcoming deadlines.'),
  aiSuggestions: z.array(AiSuggestionSchema).describe('A list of AI-powered suggestions.'),
  subjects: z.array(SubjectSchema).describe('A list of the student\'s subjects with their current progress.'),
  quickAccessItems: z.array(QuickAccessItemSchema).describe('A list of 4 recently accessed items.'),
  progressData: z.array(ProgressDataSchema).describe('A list of study time data for the last 7 days.'),
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

Generate the following data in English:
1.  **Subjects**: Create an array for the following subjects: {{{subjects}}}. For each subject, generate a realistic progress percentage (0-100). The ID should be the subject name in lowercase with spaces replaced by hyphens.
2.  **Tasks**: 4-5 realistic study tasks for today. Some should be completed.
3.  **Deadlines**: 3-4 upcoming deadlines with varied subjects, dates, and statuses. Make sure at least one deadline is 'behind' and at least one is 'risk'.
4.  **Alerts**: 2-3 important alerts. **Crucially, these alerts must be based on the deadlines you just generated.**
    *   If a deadline status is 'behind', create a 'destructive' alert about it.
    *   If a deadline status is 'risk', create a 'warning' alert about it.
    *   You can also add a general 'info' or 'success' alert.
5.  **AI Suggestions**: 3 actionable and helpful suggestions for the student.
6.  **Quick Access Items**: Generate exactly 4 realistic, recently used items. For example, a recently opened summary, a quiz that was just taken, an uploaded file, or some notes.
7.  **Progress Data**: Generate an array representing study time for the last 7 days. The days should be abbreviated ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'). The study time should be a number of minutes (e.g., between 0 and 180). Make the data look realistic for a student, with some days having more study time than others.

Ensure all generated data is in English. All IDs should be unique strings.
Make the data interconnected and logical. For example, a deadline for a subject should have related tasks. An alert MUST be about a deadline. A quick access item might relate to a recent task.
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
