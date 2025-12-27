import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { gradeStudentAnswer } from '@/ai/flows/grade-answer';

interface GradingRequest {
  blockId: string;
  studentAnswer: string;
  questionData: any;
  gradingCriteria?: string;
  sampleAnswer?: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GradingRequest = await request.json();
    const { blockId, studentAnswer, questionData, gradingCriteria, sampleAnswer } = body;

    if (!blockId || !studentAnswer) {
      return NextResponse.json({ error: 'blockId and studentAnswer are required' }, { status: 400 });
    }

    // Verify the user has access to this block
    const { data: block, error: blockError } = await supabase
      .from('blocks')
      .select(`
        id,
        type,
        assignment_id,
        assignments!inner (
          paragraph_id,
          paragraphs!inner (
            chapter_id,
            chapters!inner (
              subject_id,
              subjects!inner (
                class_id,
                classes!inner (
                  owner_id
                )
              )
            )
          )
        )
      `)
      .eq('id', blockId)
      .single();

    if (blockError || !block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    const isOwner = block.assignments.paragraphs.chapters.subjects.classes.owner_id === user.id;
    const isStudent = !isOwner;

    if (!isOwner && !isStudent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if student already has an answer for this block
    const { data: existingAnswer, error: answerError } = await supabase
      .from('student_answers')
      .select('*')
      .eq('block_id', blockId)
      .eq('student_id', user.id)
      .single();

    if (answerError && answerError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing answer:', answerError);
      return NextResponse.json({ error: 'Failed to check existing answer' }, { status: 500 });
    }

    // Generate AI grading using the grading flow
    const aiResponse = await gradeStudentAnswer({
      question: questionData.question || questionData.text || 'Question not provided',
      studentAnswer,
      questionType: block.type,
      gradingCriteria,
      sampleAnswer
    });

    // Extract the grading results
    const { score, feedback, reasoning, isCorrect } = aiResponse;

    // Save or update the student answer with AI grading
    const answerData = {
      block_id: blockId,
      student_id: user.id,
      answer_data: { text: studentAnswer },
      is_correct: isCorrect,
      score: score,
      feedback: feedback,
      graded_by_ai: true,
      submitted_at: new Date().toISOString()
    };

    const { error: saveError } = await supabase
      .from('student_answers')
      .upsert(answerData, {
        onConflict: 'student_id,block_id'
      });

    if (saveError) {
      console.error('Error saving student answer:', saveError);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }

    // Update progress snapshot (function will be called via trigger)
    // The update_progress_snapshot function is triggered on student_answers changes

    return NextResponse.json({
      score,
      feedback,
      reasoning,
      isCorrect
    });

  } catch (error) {
    console.error('AI grading error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



// Endpoint for teacher to override AI grading
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { blockId, studentId, score, feedback, isCorrect } = body;

    if (!blockId || !studentId || score === undefined) {
      return NextResponse.json({ error: 'blockId, studentId, and score are required' }, { status: 400 });
    }

    // Verify teacher has access to this block
    const { data: block, error: blockError } = await supabase
      .from('blocks')
      .select(`
        assignments!inner (
          paragraphs!inner (
            chapters!inner (
              subjects!inner (
                classes!inner (
                  owner_id
                )
              )
            )
          )
        )
      `)
      .eq('id', blockId)
      .single();

    if (blockError || !block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    if (block.assignments.paragraphs.chapters.subjects.classes.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only teachers can override grades' }, { status: 403 });
    }

    // Update the student answer with teacher override
    const { error: updateError } = await supabase
      .from('student_answers')
      .update({
        score: Math.max(0, Math.min(100, score)),
        feedback: feedback || null,
        is_correct: isCorrect,
        graded_by_ai: false,
        graded_at: new Date().toISOString()
      })
      .eq('block_id', blockId)
      .eq('student_id', studentId);

    if (updateError) {
      console.error('Error updating grade:', updateError);
      return NextResponse.json({ error: 'Failed to update grade' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Grade override error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}