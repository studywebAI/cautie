import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/subjects/[subjectId]/chapters - Get all chapters for a subject
export async function GET(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to this subject
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, class_id')
      .eq('id', params.subjectId)
      .single()

    if (subjectError || !subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Check if user has access to the class
    const { data: classAccess, error: classError } = await supabase
      .from('classes')
      .select('id, owner_id')
      .eq('id', subject.class_id)
      .single()

    if (classError || !classAccess) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const isOwner = classAccess.owner_id === user.id
    const { data: isMember } = await supabase
      .from('class_members')
      .select('user_id')
      .eq('class_id', subject.class_id)
      .eq('user_id', user.id)
      .single()

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get chapters with paragraphs
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select(`
        id,
        title,
        chapter_number,
        ai_summary,
        created_at,
        paragraphs (
          id,
          title,
          paragraph_number,
          created_at
        )
      `)
      .eq('subject_id', params.subjectId)
      .order('chapter_number', { ascending: true })

    if (error) {
      console.error('Error fetching chapters:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to match expected format
    const transformedChapters = (chapters || []).map((chapter: any) => ({
      id: chapter.id,
      title: chapter.title,
      description: chapter.ai_summary, // Use ai_summary as description
      order_index: chapter.chapter_number,
      created_at: chapter.created_at,
      paragraphs: (chapter.paragraphs || []).map((para: any) => ({
        id: para.id,
        title: para.title,
        order_index: para.paragraph_number,
        created_at: para.created_at
      }))
    }))

    return NextResponse.json(transformedChapters)
  } catch (error) {
    console.error('Unexpected error in chapters GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/subjects/[subjectId]/chapters - Create a new chapter
export async function POST(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Chapter title is required' }, { status: 400 })
    }

    // Verify user has access to create chapters for this subject
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, class_id')
      .eq('id', params.subjectId)
      .single()

    if (subjectError || !subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Check if user owns the class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('owner_id')
      .eq('id', subject.class_id)
      .single()

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    if (classData.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only class owners can create chapters' }, { status: 403 })
    }

    // Get the next chapter_number
    const { data: lastChapter } = await supabase
      .from('chapters')
      .select('chapter_number')
      .eq('subject_id', params.subjectId)
      .order('chapter_number', { ascending: false })
      .limit(1)
      .single()

    const nextChapterNumber = lastChapter ? lastChapter.chapter_number + 1 : 1

    const { data: chapter, error: insertError } = await supabase
      .from('chapters')
      .insert([{
        subject_id: params.subjectId,
        title: title.trim(),
        ai_summary: description?.trim() || null,
        chapter_number: nextChapterNumber
      }])
      .select('id, title, ai_summary, chapter_number, created_at')
      .single()

    if (insertError) {
      console.error('Error creating chapter:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Transform to match expected format
    return NextResponse.json({
      id: chapter.id,
      title: chapter.title,
      description: chapter.ai_summary,
      order_index: chapter.chapter_number,
      created_at: chapter.created_at
    })
  } catch (error) {
    console.error('Unexpected error in chapters POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}