
import {defineFlow, runFlow} from 'genkit';
import {z} from 'zod';
import {ai} from '../genkit';
import {extractTextFromFile} from '../util';
import {PersonalTask} from '@/lib/types';

const StudyPlanRequestSchema = z.object({
    taskType: z.enum(['test', 'homework', 'project']),
    description: z.string(),
    dueDate: z.string(), // YYYY-MM-DD
    file: z.any().optional(), // Represents a file-like object for server-side processing
});

const StudyPlanTaskSchema = z.object({
    title: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
    subject: z.string(),
    description: z.string(),
    is_completed: z.boolean(),
});

const StudyPlanResponseSchema = z.object({
    tasks: z.array(StudyPlanTaskSchema),
});

export const createStudyPlan = defineFlow(
    {
        name: 'createStudyPlan',
        inputSchema: StudyPlanRequestSchema,
        outputSchema: StudyPlanResponseSchema,
    },
    async (request) => {
        const {taskType, description, dueDate, file} = request;

        let fileContent = '';
        if (file) {
            try {
                fileContent = await extractTextFromFile(file);
            } catch (error) {
                console.error('Error extracting text from file:', error);
                // Decide if you want to throw or just continue without file content
                fileContent = 'Error reading file content.';
            }
        }

        const prompt = `
            You are an expert academic assistant. Your goal is to create a detailed, day-by-day study plan for a student.

            **Student's Goal:**
            - Task Type: ${taskType}
            - Description: ${description}
            - Due Date: ${dueDate}
            
            ${fileContent ? `**Additional Context from Document:**\n${fileContent}` : ''}

            **Instructions:**
            1.  Analyze the provided information (task type, description, due date, and any file content).
            2.  Break down the preparation into logical, manageable daily tasks.
            3.  The plan should start from tomorrow's date and end on the due date.
            4.  For each day, create a specific, actionable task.
            5.  Determine an appropriate "subject" for each task (e.g., History, Math, Reading, Research).
            6.  Return the plan as a JSON object adhering to the specified schema.
            7.  Do not include tasks on the due date itself, except for a final review or submission task.

            **Current Date:** ${new Date().toISOString().split('T')[0]}

            Respond with ONLY the JSON object.
        `;

        const llmResponse = await ai.generate({
            model: 'googleai/gemini-1.5-flash',
            prompt: prompt,
            output: {
                format: 'json',
                schema: StudyPlanResponseSchema,
            },
        });

        const studyPlan = llmResponse.output();

        if (!studyPlan) {
            throw new Error('Failed to generate a valid study plan from the AI model.');
        }

        // Further validation to ensure dates are logical (optional but good practice)
        const validatedPlan = studyPlan.tasks.filter(task => {
            const taskDate = new Date(task.date);
            const dueDateObj = new Date(dueDate);
            return taskDate <= dueDateObj;
        });

        return {
            tasks: validatedPlan,
        };
    }
);
