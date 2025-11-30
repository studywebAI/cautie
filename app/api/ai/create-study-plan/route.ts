import { NextRequest, NextResponse } from 'next/server';
import { createStudyPlan } from '@lib/ai/flows/study-plan';
import { promises as fs } from 'fs';
import { ai } from '@lib/ai/genkit';
import path from 'path';
import os from 'os';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        
        const taskTypeRaw = formData.get('taskType');
        const description = formData.get('description') as string;
        const dueDate = formData.get('dueDate') as string;
        const file = formData.get('file') as File | null;

        if (typeof taskTypeRaw !== 'string' || !['test', 'homework', 'project'].includes(taskTypeRaw)) {
            return NextResponse.json({ error: 'Invalid taskType provided.' }, { status: 400 });
        }
        const taskType = taskTypeRaw as "test" | "homework" | "project";

        let fileDetails = undefined;

        if (file) {
            // Save file temporarily to disk to get a path for processing
            const tempDir = os.tmpdir();
            const tempFilePath = path.join(tempDir, file.name);
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(tempFilePath, fileBuffer);

            fileDetails = {
                path: tempFilePath,
                mimetype: file.type,
            };
        }

        let studyPlanRequest: any = {
            taskType,
            description,
            dueDate,
        };

        // Execute the Genkit flow
        const result = await ai.run('createStudyPlan', studyPlanRequest);

        // Clean up the temporary file if it was created
        if (fileDetails) {
            await fs.unlink(fileDetails.path);
        }

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error('API Route Error:', error);
        return NextResponse.json({ 
            error: 'Failed to create study plan.',
            details: error.message 
        }, { status: 500 });
    }
}
