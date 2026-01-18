import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET paragraphs for a chapter
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

    // Verify chapter belongs to subject and check access
    const { data: chapterData, error: chapterError } = await supabase
      .from('chapters')
      .select(`
        *,
        subjects!inner(class_id, user_id)
      `)
      .eq('id', params.chapterId)
      .eq('subject_id', params.subjectId)
      .single()

    if (chapterError || !chapterData) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    const subjectData = chapterData.subjects as any
    const classId = subjectData.class_id

    // Check access (support both class-associated and global subjects)
    if (classId) {
      // Subject is associated with a class
      const { data: classAccess, error: classError } = await supabase
        .from('classes')
        .select('owner_id')
        .eq('id', classId)
        .single()

      if (classError || !classAccess) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 })
      }

      const isOwner = classAccess.owner_id === user.id

      if (!isOwner) {
        const { data: memberData, error: memberError } = await supabase
          .from('class_members')
          .select('class_id')
          .eq('class_id', classId)
          .eq('user_id', user.id)
          .single()

        if (memberError || !memberData) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      }
    } else {
      // Global subject - only subject owner can access
      if (subjectData.user_id !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Get paragraphs for this chapter
    const { data: paragraphs, error: paragraphsError } = await supabase
      .from('paragraphs')
      .select('*')
      .eq('chapter_id', params.chapterId)
      .order('paragraph_number', { ascending: true })

    if (paragraphsError) {
      console.error('Error fetching paragraphs:', paragraphsError)
      return NextResponse.json({ error: paragraphsError.message }, { status: 500 })
    }

    // Get assignment counts and progress for each paragraph
    const paragraphIds = (paragraphs || []).map(p => p.id)
    let assignmentCounts: Record<string, number> = {}
    let progressData: Record<string, number> = {}

    if (paragraphIds.length > 0) {
      // Get assignment counts
      const { data: counts, error: countError } = await supabase
        .from('assignments')
        .select('paragraph_id')
        .in('paragraph_id', paragraphIds)

      if (!countError && counts) {
        assignmentCounts = counts.reduce((acc, assignment) => {
          if (assignment.paragraph_id) {
            acc[assignment.paragraph_id] = (acc[assignment.paragraph_id] || 0) + 1
          }
          return acc
        }, {} as Record<string, number>)
      }

      // Get progress for current user
      const { data: progress, error: progressError } = await supabase
        .from('progress_snapshots')
        .select('paragraph_id, completion_percent')
        .in('paragraph_id', paragraphIds)
        .eq('student_id', user.id)

      if (!progressError && progress) {
        progressData = progress.reduce((acc, p) => {
          acc[p.paragraph_id] = p.completion_percent
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Transform data
    const transformedParagraphs = (paragraphs || []).map(paragraph => ({
      ...paragraph,
      assignment_count: assignmentCounts[paragraph.id] || 0,
      progress_percent: progressData[paragraph.id] || 0
    }))

    return NextResponse.json(transformedParagraphs)
  } catch (error) {
    console.error('Unexpected error in paragraphs GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new paragraph
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

    // Verify chapter belongs to subject and check permissions
    const { data: chapterData, error: chapterError } = await supabase
      .from('chapters')
      .select(`
        *,
        subjects!inner(class_id, user_id)
      `)
      .eq('id', params.chapterId)
      .eq('subject_id', params.subjectId)
      .single()

    if (chapterError || !chapterData) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    const subjectData = chapterData.subjects as any
    const classId = subjectData.class_id

    // Check permissions
    if (classId) {
      // Subject associated with class - class owner can create paragraphs
      const { data: classAccess, error: classError } = await supabase
        .from('classes')
        .select('owner_id')
        .eq('id', classId)
        .single()

      if (classError || !classAccess) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 })
      }

      if (classAccess.owner_id !== user.id) {
        return NextResponse.json({ error: 'Only class owners can create paragraphs' }, { status: 403 })
      }
    } else {
      // Global subject - only subject owner can create paragraphs
      if (subjectData.user_id !== user.id) {
        return NextResponse.json({ error: 'Only subject owners can create paragraphs' }, { status: 403 })
      }
    }

    const { title } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Get next paragraph number
    const { data: nextNumber, error: numberError } = await supabase
      .rpc('get_next_paragraph_number', { chapter_uuid: params.chapterId })

    if (numberError) {
      console.error('Error getting next paragraph number:', numberError)
      return NextResponse.json({ error: 'Failed to generate paragraph number' }, { status: 500 })
    }

    // Create paragraph
    const { data: paragraph, error: insertError } = await supabase
      .from('paragraphs')
      .insert({
        chapter_id: params.chapterId,
        paragraph_number: nextNumber,
        title: title.trim()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating paragraph:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      ...paragraph,
      assignment_count: 0,
      progress_percent: 0
    })
  } catch (error) {
    console.error('Unexpected error in paragraphs POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}