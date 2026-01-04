import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET subjects for a specific class
export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this class
    const { data: classAccess, error: classError } = await supabase
      .from('classes')
      .select('id, owner_id, user_id')
      .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)

    console.log('DEBUG: Subjects GET - Class access check:', { classAccess, classError, paramsClassId: params.classId, userId: user.id })

    if (classError || !classAccess?.some(c => c.id === params.classId)) {
      // Check if user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('class_id', params.classId)
        .eq('user_id', user.id)
        .single()

      console.log('DEBUG: Subjects GET - Member check:', { memberData, memberError })

      if (memberError || !memberData) {
        console.log('DEBUG: Subjects GET - Access denied')
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Get subjects with real progress data
    console.log('Fetching subjects for classId:', params.classId)
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select(`
        *,
        chapters(
          id,
          title,
          chapter_number,
          paragraphs(
            id,
            title,
            paragraph_number,
            progress_snapshots!inner(
              completion_percent
            )
          )
        )
      `)
      .eq('class_id', params.classId)
      .order('created_at', { ascending: false })

    console.log('Subjects query result:', { subjects, error: subjectsError })

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError)
      return NextResponse.json({ error: subjectsError.message }, { status: 500 })
    }

    // Transform the data to match expected format with real progress
    const transformedSubjects = subjects?.map(subject => {
      // Get recent paragraphs with real progress data
      let recentParagraphs = [];

      if (subject.chapters && Array.isArray(subject.chapters)) {
        // Flatten all paragraphs from all chapters and sort by most recent
        const allParagraphs = subject.chapters.flatMap((chapter: any) =>
          chapter.paragraphs?.map((para: any) => ({
            id: para.id,
            title: para.title,
            progress: para.progress_snapshots?.[0]?.completion_percent || 0
          })) || []
        );

        // Sort by progress (most completed first) and take top 3
        recentParagraphs = allParagraphs
          .sort((a, b) => b.progress - a.progress)
          .slice(0, 3);
      }

      return {
        id: subject.id,
        title: subject.title,
        class_label: subject.class_label || subject.title,
        cover_type: subject.cover_type,
        cover_image_url: subject.cover_image_url,
        ai_icon_seed: subject.ai_icon_seed,
        created_at: subject.created_at,
        content: {
          class_label: subject.class_label || subject.title,
          cover_type: subject.cover_type,
          cover_image_url: subject.cover_image_url,
          ai_icon_seed: subject.ai_icon_seed
        },
        recentParagraphs
      };
    }) || []

    return NextResponse.json(transformedSubjects)
  } catch (error) {
    console.error('Unexpected error in subjects GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new subject
export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is teacher/owner of this class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('owner_id, user_id')
      .eq('id', params.classId)
      .single()

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const isOwner = classData.owner_id === user.id || classData.user_id === user.id

    if (!isOwner) {
      // Check if user is a teacher in this class
      const { data: memberData } = await supabase
        .from('class_members')
        .select('role')
        .eq('class_id', params.classId)
        .eq('user_id', user.id)
        .single()

      if (!memberData || memberData.role !== 'teacher') {
        return NextResponse.json({ error: 'Only teachers can create subjects' }, { status: 403 })
      }
    }

    const { title, class_label, cover_type, cover_image_url } = await request.json()
    console.log('Creating subject for classId:', params.classId, { title, class_label, cover_type, cover_image_url })

    // Insert real subject into database
    const subjectData = {
      class_id: params.classId,
      title,
      class_label: class_label || title,
      cover_type: cover_type || 'ai_icons',
      cover_image_url,
      ai_icon_seed: Math.random().toString(36).substring(2, 15)
    }
    console.log('Inserting subject data:', subjectData)

    const { data: subject, error: insertError } = await supabase
      .from('subjects')
      .insert([subjectData])
      .select()
      .single()

    console.log('Subject creation result:', { subject, error: insertError })

    if (insertError) {
      console.error('Error creating subject:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      id: subject.id,
      title: subject.title,
      class_label: subject.class_label || subject.title,
      cover_type: subject.cover_type,
      cover_image_url: subject.cover_image_url,
      ai_icon_seed: subject.ai_icon_seed,
      created_at: subject.created_at,
      content: {
        class_label: subject.class_label || subject.title,
        cover_type: subject.cover_type,
        cover_image_url: subject.cover_image_url,
        ai_icon_seed: subject.ai_icon_seed
      }
    })
  } catch (error) {
    console.error('Unexpected error in subjects POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}