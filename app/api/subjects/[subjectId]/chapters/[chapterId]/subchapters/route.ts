import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/subjects/[subjectId]/chapters/[chapterId]/paragraphs - Get all paragraphs for a chapter
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

    // Get paragraphs
    const { data: paragraphs, error } = await supabase
      .from('paragraphs')
      .select('id, title, paragraph_number, created_at')
      .eq('chapter_id', params.chapterId)
      .order('paragraph_number', { ascending: true })

    if (error) {
      console.error('Error fetching paragraphs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to match expected format
    const transformedParagraphs = (paragraphs || []).map(para => ({
      id: para.id,
      title: para.title,
      order_index: para.paragraph_number,
      created_at: para.created_at
    }))

    return NextResponse.json(transformedParagraphs)
  } catch (error) {
    console.error('Unexpected error in paragraphs GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/subjects/[subjectId]/chapters/[chapterId]/paragraphs - Create a new paragraph
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

    const { title } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Paragraph title is required' }, { status: 400 })
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
      .select('owner_id, user_id')
      .eq('id', subject.class_id)
      .single()

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const isOwner = classData.owner_id === user.id || classData.user_id === user.id

    if (!isOwner) {
      return NextResponse.json({ error: 'Only class owners can create paragraphs' }, { status: 403 })
    }

    // Get the next paragraph_number
    const { data: lastParagraph } = await supabase
      .from('paragraphs')
      .select('paragraph_number')
      .eq('chapter_id', params.chapterId)
      .order('paragraph_number', { ascending: false })
      .limit(1)
      .single()

    const nextParagraphNumber = lastParagraph ? lastParagraph.paragraph_number + 1 : 1

    const { data: paragraph, error: insertError } = await supabase
      .from('paragraphs')
      .insert([{
        chapter_id: params.chapterId,
        title: title.trim(),
        paragraph_number: nextParagraphNumber
      }])
      .select('id, title, paragraph_number, created_at')
      .single()

    if (insertError) {
      console.error('Error creating paragraph:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Transform to match expected format
    return NextResponse.json({
      id: paragraph.id,
      title: paragraph.title,
      order_index: paragraph.paragraph_number,
      created_at: paragraph.created_at
    })
  } catch (error) {
    console.error('Unexpected error in paragraphs POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}