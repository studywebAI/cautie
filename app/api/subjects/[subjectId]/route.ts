import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, { params }: { params: { subjectId: string } }) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = params.subjectId;

    if (!classId) {
      return NextResponse.json({ error: 'classId parameter required' }, { status: 400 });
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

    // Check if subject belongs to the class
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('id, title, class_label, cover_type, cover_image_url, ai_icon_seed')
      .eq('id', subjectId)
      .eq('class_id', classId)
      .single();

    if (subjectError || !subjectData) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Fetch chapters with paragraphs and progress
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select(`
        id,
        title,
        chapter_number,
        ai_summary,
        summary_overridden,
        paragraphs (
          id,
          title,
          paragraph_number,
          progress_snapshots (
            completion_percent,
            student_id
          )
        )
      `)
      .eq('subject_id', subjectId)
      .order('chapter_number', { ascending: true });

    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
    }

    // Process chapters with progress
    const processedChapters = chapters?.map(chapter => ({
      ...chapter,
      paragraphs: chapter.paragraphs?.map((paragraph: any) => ({
        ...paragraph,
        progress: paragraph.progress_snapshots?.find((p: any) => p.student_id === user.id)?.completion_percent || 0
      })) || []
    })) || [];

    // Calculate overall progress
    let totalParagraphs = 0;
    let completedParagraphs = 0;

    processedChapters.forEach(chapter => {
      chapter.paragraphs.forEach((paragraph: any) => {
        totalParagraphs++;
        if (paragraph.progress >= 80) {
          completedParagraphs++;
        }
      });
    });

    const overallProgress = totalParagraphs > 0 ? Math.round((completedParagraphs / totalParagraphs) * 100) : 0;

    const subject = {
      ...subjectData,
      chapters: processedChapters,
      overallProgress,
      totalParagraphs
    };

    return NextResponse.json({ subject });
  } catch (error) {
    console.error('Subject detail GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}