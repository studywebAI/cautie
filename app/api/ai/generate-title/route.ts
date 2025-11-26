
import { NextRequest, NextResponse } from 'next/server';
import { runFlow } from 'genkit';
import { generateTitle } from '@/lib/ai/flows/title-generator';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const result = await runFlow(generateTitle, { text });

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error('API Route Error:', error);
        return NextResponse.json({ 
            error: 'Failed to generate title.',
            details: error.message 
        }, { status: 500 });
    }
}
