
import { NextRequest, NextResponse } from 'next/server';
import { createStudyPlan } from '@lib/ai/flows/study-plan';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const taskType = formData.get('taskType') as string;
        const description = formData.get('description') as string;
        const dueDate = formData.get('dueDate') as string;
        const file = formData.get('file') as File | null;

        if (!taskType || !description || !dueDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let studyPlanRequest: any = {
            taskType,
            description,
            dueDate,
        };

        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const tempFilePath = path.join(os.tmpdir(), file.name);
            await fs.writeFile(tempFilePath, buffer);
            studyPlanRequest.file = tempFilePath;
        }

        const result = await createStudyPlan(studyPlanRequest);

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error('API Route Error:', error);
        return NextResponse.json({ 
            error: 'Failed to create study plan.',
            details: error.message 
        }, { status: 500 });
    }
}
