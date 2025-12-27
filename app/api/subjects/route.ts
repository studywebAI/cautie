import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

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

    // Fetch subjects for this class with progress info
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select(`
        *,
        chapters (
          id,
          title,
          chapter_number,
          ai_summary,
          paragraphs (
            id,
            title,
            paragraph_number,
            progress_snapshots (
              completion_percent,
              student_id
            )
          )
        )
      `)
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
      return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
    }

    // Process subjects with progress calculation
    const processedSubjects = subjects?.map(subject => {
      // Calculate overall progress for this subject
      let totalParagraphs = 0;
      let completedParagraphs = 0;

      subject.chapters?.forEach((chapter: any) => {
        chapter.paragraphs?.forEach((paragraph: any) => {
          totalParagraphs++;
          // Check if user has completed this paragraph (progress >= some threshold, say 80%)
          const userProgress = paragraph.progress_snapshots?.find((p: any) => p.student_id === user.id);
          if (userProgress && userProgress.completion_percent >= 80) {
            completedParagraphs++;
          }
        });
      });

      const overallProgress = totalParagraphs > 0 ? (completedParagraphs / totalParagraphs) * 100 : 0;

      // Get current 3 paragraphs for progress preview
      const allParagraphs: Array<{
        id: string;
        title: string;
        chapterNumber: number;
        paragraphNumber: number;
        progress: number;
      }> = [];

      subject.chapters?.forEach((chapter: any) => {
        chapter.paragraphs?.forEach((paragraph: any) => {
          const userProgress = paragraph.progress_snapshots?.find((p: any) => p.student_id === user.id);
          allParagraphs.push({
            id: paragraph.id,
            title: paragraph.title,
            chapterNumber: chapter.chapter_number,
            paragraphNumber: paragraph.paragraph_number,
            progress: userProgress?.completion_percent || 0
          });
        });
      });

      // Sort by most recent activity and get top 3
      const currentParagraphs = allParagraphs
        .sort((a, b) => b.progress - a.progress) // Sort by progress (incomplete first)
        .slice(0, 3);

      return {
        ...subject,
        overallProgress: Math.round(overallProgress),
        currentParagraphs,
        totalChapters: subject.chapters?.length || 0,
        totalParagraphs
      };
    });

    return NextResponse.json({ subjects: processedSubjects });
  } catch (error) {
    console.error('Subjects GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { classId, title, classLabel } = body;

    if (!classId || !title) {
      return NextResponse.json({ error: 'classId and title are required' }, { status: 400 });
    }

    // Check if user is teacher/owner of the class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('owner_id')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (classData.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only class owners can create subjects' }, { status: 403 });
    }

    // Create the subject
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .insert({
        class_id: classId,
        title,
        class_label: classLabel
      })
      .select()
      .single();

    if (subjectError) {
      console.error('Error creating subject:', subjectError);
      return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
    }

    return NextResponse.json({ subject });
  } catch (error) {
    console.error('Subjects POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}