import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, { params }: { params: { chapterId: string } }) {
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
    const chapterId = params.chapterId;

    if (!classId || !subjectId) {
      return NextResponse.json({ error: 'classId and subjectId parameters required' }, { status: 400 });
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

    // Check if chapter belongs to the subject and class
    const { data: chapterData, error: chapterError } = await supabase
      .from('chapters')
      .select(`
        id,
        title,
        chapter_number,
        ai_summary,
        summary_overridden,
        subject_id,
        subjects!inner (
          class_id
        )
      `)
      .eq('id', chapterId)
      .eq('subject_id', subjectId)
      .eq('subjects.class_id', classId)
      .single();

    if (chapterError || !chapterData) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Fetch paragraphs with assignments and progress
    const { data: paragraphs, error: paragraphsError } = await supabase
      .from('paragraphs')
      .select(`
        id,
        title,
        paragraph_number,
        assignments (
          id,
          title,
          assignment_index,
          answers_enabled
        ),
        progress_snapshots (
          completion_percent,
          student_id
        )
      `)
      .eq('chapter_id', chapterId)
      .order('paragraph_number', { ascending: true });

    if (paragraphsError) {
      console.error('Error fetching paragraphs:', paragraphsError);
      return NextResponse.json({ error: 'Failed to fetch paragraphs' }, { status: 500 });
    }

    // Process paragraphs with progress and sorted assignments
    const processedParagraphs = paragraphs?.map(paragraph => ({
      ...paragraph,
      progress: paragraph.progress_snapshots?.find((p: any) => p.student_id === user.id)?.completion_percent || 0,
      assignments: paragraph.assignments?.sort((a: any, b: any) => a.assignment_index - b.assignment_index) || []
    })) || [];

    const chapter = {
      id: chapterData.id,
      title: chapterData.title,
      chapter_number: chapterData.chapter_number,
      ai_summary: chapterData.ai_summary,
      summary_overridden: chapterData.summary_overridden,
      paragraphs: processedParagraphs
    };

    return NextResponse.json({ chapter });
  } catch (error) {
    console.error('Chapter detail GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}