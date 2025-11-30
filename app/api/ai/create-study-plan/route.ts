

import { NextRequest, NextResponse } from 'next/server';
import { createStudyPlan } from '@lib/ai/flows/study-plan';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// This handler will process the multipart/form-data from the client
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        
        const taskType = formData.get('taskType') as 'test' | 'homework' | 'project';
        const description = formData.get('description') as string;
        const dueDate = formData.get('dueDate') as string;
        const file = formData.get('file') as File | null;

        if (!['test', 'homework', 'project'].includes(taskType)) {
            return NextResponse.json({ error: 'Invalid task type provided.' }, { status: 400 });
        }

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

        const studyPlanRequest = {
            taskType,
            description,
            dueDate,
            file: fileDetails,
        };

        // Execute the Genkit flow
        const result = await createStudyPlan(studyPlanRequest);

        // Clean up the temporary file if it was created
        if (fileDetails) {
            await fs.unlink(fileDetails.path);
        }

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error('API Route Error:', error);
        return NextResponse.json({ 
            error: 'Failed to generate study plan.',
            details: error.message 
        }, { status: 500 });
    }
}
