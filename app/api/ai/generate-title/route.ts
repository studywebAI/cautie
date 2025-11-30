import { NextRequest, NextResponse } from 'next/server';
import { generateTitle } from '@lib/ai/flows/title-generator';
import { ai } from '@lib/ai/genkit';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const result = await ai.run('generateTitle', { text });

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error('API Route Error:', error);
        return NextResponse.json({ 
            error: 'Failed to generate title.',
            details: error.message 
        }, { status: 500 });
    }
}
