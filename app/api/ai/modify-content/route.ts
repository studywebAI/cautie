import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const { prompt, scope, blockData, pageData, assignmentData, blockType } = await request.json();

    // This would be a premium feature check in production
    // For now, we'll simulate the AI response

    let contentToModify = '';
    let context = '';

    if (scope === 'block') {
      // Extract content from the specific block
      contentToModify = extractBlockContent(blockData, blockType);
      context = `Modifying a single ${blockType} block`;
    } else if (scope === 'page') {
      // Extract content from all blocks on the page
      contentToModify = pageData?.map((block: any) => extractBlockContent(block.data, block.type)).join('\n\n') || '';
      context = `Modifying an entire page with ${pageData?.length || 0} blocks`;
    } else if (scope === 'assignment') {
      // Extract content from the entire assignment
      contentToModify = assignmentData?.blocks?.map((block: any) => extractBlockContent(block.data, block.type)).join('\n\n') || '';
      context = `Modifying an entire assignment with ${assignmentData?.blocks?.length || 0} blocks`;
    }

    let aiResponse: string;

    if (openai) {
      // Create AI prompt
      const systemPrompt = `You are an AI assistant helping teachers modify educational content. Your task is to modify the provided content based on the user's request.

Context: ${context}
Content to modify: ${contentToModify}

User request: ${prompt}

Please provide the modified content in the appropriate format for the block type. Be helpful, accurate, and maintain educational quality.`;

      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      aiResponse = completion.choices[0]?.message?.content || '';
    } else {
      // Mock response for development
      aiResponse = generateMockResponse(prompt, blockType, contentToModify);
    }

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse and format the response based on scope
    if (scope === 'block') {
      const modifiedData = parseBlockResponse(aiResponse, blockType, blockData);
      return NextResponse.json({
        success: true,
        modifiedData,
        originalScope: scope
      });
    } else if (scope === 'page') {
      // For page scope, we'd need to distribute changes across multiple blocks
      // This is complex, so for now we'll return a placeholder
      return NextResponse.json({
        success: true,
        modifiedBlocks: [],
        message: "Page-wide modifications coming soon",
        originalScope: scope
      });
    } else {
      // Assignment scope - similar to page but even broader
      return NextResponse.json({
        success: true,
        message: "Assignment-wide modifications coming soon",
        originalScope: scope
      });
    }

  } catch (error) {
    console.error('AI modification error:', error);
    return NextResponse.json(
      { error: 'Failed to modify content with AI' },
      { status: 500 }
    );
  }
}

function extractBlockContent(data: any, type: string): string {
  switch (type) {
    case 'text':
      return data.content || '';
    case 'multiple_choice':
      return `Question: ${data.question}\nOptions: ${data.options?.map((opt: any) => opt.text).join(', ')}`;
    case 'open_question':
      return `Question: ${data.question}\nCriteria: ${data.grading_criteria}`;
    case 'fill_in_blank':
      return `Text: ${data.text}\nAnswers: ${data.answers?.join(', ')}`;
    case 'drag_drop':
      return `Prompt: ${data.prompt}\nPairs: ${data.pairs?.map((pair: any) => `${pair.left} → ${pair.right}`).join(', ')}`;
    case 'ordering':
      return `Prompt: ${data.prompt}\nItems: ${data.items?.join(', ')}`;
    default:
      return JSON.stringify(data);
  }
}

function parseBlockResponse(aiResponse: string, blockType: string, originalData: any): any {
  // Clean up AI response and parse it back into block data format
  const cleaned = aiResponse.trim();

  switch (blockType) {
    case 'text':
      // Extract just the text content
      return { ...originalData, content: cleaned };

    case 'multiple_choice':
      // Try to parse question and options
      const lines = cleaned.split('\n');
      const question = lines.find(line => line.startsWith('Question:'))?.replace('Question:', '').trim() || originalData.question;
      const optionsText = lines.find(line => line.startsWith('Options:'))?.replace('Options:', '').trim();
      const options = optionsText ? optionsText.split(',').map((text: string, index: number) => ({
        id: String.fromCharCode(97 + index),
        text: text.trim(),
        correct: index === 0 // First option as correct by default
      })) : originalData.options;

      return { ...originalData, question, options };

    case 'open_question':
      // Extract question and criteria
      const questionMatch = cleaned.match(/Question:\s*(.+?)(?:\n|$)/i);
      const criteriaMatch = cleaned.match(/Criteria:\s*(.+?)(?:\n|$)/i);

      return {
        ...originalData,
        question: questionMatch ? questionMatch[1].trim() : originalData.question,
        grading_criteria: criteriaMatch ? criteriaMatch[1].trim() : originalData.grading_criteria
      };

    case 'fill_in_blank':
      // Extract text and answers
      const textMatch = cleaned.match(/Text:\s*(.+?)(?:\n|$)/i);
      const answersMatch = cleaned.match(/Answers:\s*(.+?)(?:\n|$)/i);

      return {
        ...originalData,
        text: textMatch ? textMatch[1].trim() : originalData.text,
        answers: answersMatch ? answersMatch[1].split(',').map((a: string) => a.trim()) : originalData.answers
      };

    default:
      // For complex blocks, return as-is but try to update content
      return { ...originalData, content: cleaned };
  }
}

function generateMockResponse(prompt: string, blockType: string, content: string): string {
  // Mock responses for development/testing when OpenAI is not configured

  if (prompt.toLowerCase().includes('translate') && prompt.toLowerCase().includes('spanish')) {
    if (blockType === 'text') {
      return "Hola, este es el contenido traducido al español.";
    }
  }

  if (prompt.toLowerCase().includes('easier') || prompt.toLowerCase().includes('simpler')) {
    if (blockType === 'text') {
      return "This is simpler content that students can understand more easily.";
    }
  }

  if (prompt.toLowerCase().includes('add') && prompt.toLowerCase().includes('question')) {
    if (blockType === 'multiple_choice') {
      return `Question: ${content || 'What is the capital of France?'}
Options: Paris, London, Berlin, Madrid`;
    }
  }

  // Default mock response
  return `Modified content: ${content || 'Sample content'} (AI mock response for: ${prompt})`;
}