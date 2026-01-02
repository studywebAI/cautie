import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/subjects/[subjectId]/chapters/[chapterId]/subchapters - Get all subchapters for a chapter
export async function GET(
  request: Request,
  { params }: { params: { subjectId: string; chapterId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to this chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, subject_id')
      .eq('id', params.chapterId)
      .eq('subject_id', params.subjectId)
      .single()

    if (chapterError || !chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Get subchapters
    const { data: subchapters, error } = await supabase
      .from('subject_subchapters')
      .select('id, title, description, order_index, content, created_at')
      .eq('chapter_id', params.chapterId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching subchapters:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(subchapters || [])
  } catch (error) {
    console.error('Unexpected error in subchapters GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/subjects/[subjectId]/chapters/[chapterId]/subchapters - Create a new subchapter
export async function POST(
  request: Request,
  { params }: { params: { subjectId: string; chapterId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, content } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Subchapter title is required' }, { status: 400 })
    }

    // Verify chapter exists and user has access
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, subject_id')
      .eq('id', params.chapterId)
      .eq('subject_id', params.subjectId)
      .single()

    if (chapterError || !chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Check if user has access to the subject/class
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
      return NextResponse.json({ error: 'Only class owners can create subchapters' }, { status: 403 })
    }

    // Get the next order_index
    const { data: lastSubchapter } = await supabase
      .from('subject_subchapters')
      .select('order_index')
      .eq('chapter_id', params.chapterId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = lastSubchapter && lastSubchapter.order_index ? lastSubchapter.order_index + 1 : 1

    const { data: subchapter, error: insertError } = await supabase
      .from('subject_subchapters')
      .insert([{
        chapter_id: params.chapterId,
        title: title.trim(),
        description: description?.trim() || null,
        content: content || null,
        order_index: nextOrderIndex
      }])
      .select('id, title, description, content, order_index, created_at')
      .single()

    if (insertError) {
      console.error('Error creating subchapter:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(subchapter)
  } catch (error) {
    console.error('Unexpected error in subchapters POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}