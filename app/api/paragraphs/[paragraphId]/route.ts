import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, { params }: { params: { paragraphId: string } }) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const chapterId = searchParams.get('chapterId');
    const paragraphId = params.paragraphId;

    if (!classId || !subjectId || !chapterId) {
      return NextResponse.json({ error: 'classId, subjectId, and chapterId parameters required' }, { status: 400 });
    }

    // Check if user has access to this class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('owner_id')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const isOwner = classData.owner_id === user.id;
    let isMember = false;

    if (!isOwner) {
      const { count } = await supabase
        .from('class_members')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classId)
        .eq('user_id', user.id);

      isMember = (count || 0) > 0;
    }

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get paragraph with navigation context
    const { data: paragraphData, error: paragraphError } = await supabase
      .from('paragraphs')
      .select(`
        id,
        title,
        paragraph_number,
        chapter_id,
        chapters!inner (
          id,
          title,
          chapter_number,
          subject_id,
          subjects!inner (
            id,
            title,
            class_id
          )
        ),
        progress_snapshots (
          completion_percent,
          student_id
        )
      `)
      .eq('id', paragraphId)
      .eq('chapter_id', chapterId)
      .eq('chapters.subject_id', subjectId)
      .eq('chapters.subjects.class_id', classId)
      .single();

    if (paragraphError || !paragraphData) {
      return NextResponse.json({ error: 'Paragraph not found' }, { status: 404 });
    }

    // Get assignments with blocks
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select(`
        id,
        title,
        assignment_index,
        answers_enabled,
        blocks (
          id,
          type,
          position,
          data,
          student_answers (
            id,
            answer_data,
            is_correct,
            score,
            feedback,
            student_id
          )
        )
      `)
      .eq('paragraph_id', paragraphId)
      .order('assignment_index', { ascending: true });

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }

    // Get navigation (prev/next paragraphs)
    const { data: navigation, error: navError } = await supabase
      .from('paragraphs')
      .select('id, title, paragraph_number')
      .eq('chapter_id', chapterId)
      .order('paragraph_number', { ascending: true });

    if (navError) {
      console.error('Error fetching navigation:', navError);
    }

    // Process navigation
    const currentIndex = navigation?.findIndex(p => p.id === paragraphId) ?? -1;
    const prevParagraph = currentIndex > 0 ? navigation?.[currentIndex - 1] : null;
    const nextParagraph = currentIndex >= 0 && currentIndex < (navigation?.length ?? 0) - 1
      ? navigation?.[currentIndex + 1]
      : null;

    // Process assignments with user answers (find from blocks)
    const processedAssignments = assignments?.map(assignment => {
      // Find user answers across all blocks in this assignment
      let userAnswer = null;
      for (const block of assignment.blocks || []) {
        const blockAnswer = block.student_answers?.find((answer: any) => answer.student_id === user.id);
        if (blockAnswer) {
          userAnswer = blockAnswer;
          break; // Use the first found answer
        }
      }

      return {
        ...assignment,
        blocks: assignment.blocks?.sort((a: any, b: any) => a.position - b.position) || [],
        userAnswer
      };
    }) || [];

    const paragraph = {
      id: paragraphData.id,
      title: paragraphData.title,
      paragraph_number: paragraphData.paragraph_number,
      chapter_title: paragraphData.chapters.title,
      chapter_number: paragraphData.chapters.chapter_number,
      subject_title: paragraphData.chapters.subjects.title,
      progress: paragraphData.progress_snapshots?.find((p: any) => p.student_id === user.id)?.completion_percent || 0,
      assignments: processedAssignments,
      prevParagraph: prevParagraph ? {
        id: prevParagraph.id,
        title: prevParagraph.title,
        number: prevParagraph.paragraph_number
      } : undefined,
      nextParagraph: nextParagraph ? {
        id: nextParagraph.id,
        title: nextParagraph.title,
        number: nextParagraph.paragraph_number
      } : undefined
    };

    return NextResponse.json({ paragraph });
  } catch (error) {
    console.error('Paragraph detail GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}