import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET chapters for a subject
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

    // Check if user has access to this subject
    const { data: subjectAccess, error: subjectError } = await supabase
      .from('subjects')
      .select('id, class_id, user_id')
      .eq('id', params.subjectId)
      .single()

    if (subjectError || !subjectAccess) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // If subject is global (no class_id), only owner can access
    if (!subjectAccess.class_id) {
      if (subjectAccess.user_id !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else {
      // If subject has class_id, check class access
      const { data: classAccess, error: classError } = await supabase
        .from('classes')
        .select('id, owner_id')
        .eq('id', subjectAccess.class_id)
        .single()

      if (classError || !classAccess) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 })
      }

      const isOwner = classAccess.owner_id === user.id

      if (!isOwner) {
        // Check if user is a member
        const { data: memberData, error: memberError } = await supabase
          .from('class_members')
          .select('class_id')
          .eq('class_id', subjectAccess.class_id)
          .eq('user_id', user.id)
          .single()

        if (memberError || !memberData) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      }
    }

    // Get chapters
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('subject_id', params.subjectId)
      .order('chapter_number', { ascending: true })

    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError)
      return NextResponse.json({ error: chaptersError.message }, { status: 500 })
    }

    // Get subchapter counts for each chapter
    const chapterIds = (chapters || []).map(c => c.id)
    let subchapterCounts: Record<string, number> = {}

    if (chapterIds.length > 0) {
      const { data: counts, error: countError } = await supabase
        .from('subchapters')
        .select('chapter_id')
        .in('chapter_id', chapterIds)

      if (!countError && counts) {
        subchapterCounts = counts.reduce((acc, subchapter) => {
          acc[subchapter.chapter_id] = (acc[subchapter.chapter_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Transform data to include subchapter_count
    const transformedChapters = (chapters || []).map(chapter => ({
      ...chapter,
      subchapter_count: subchapterCounts[chapter.id] || 0
    }))

    return NextResponse.json(transformedChapters)
  } catch (error) {
    console.error('Unexpected error in chapters GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new chapter
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

    // Check if user can create chapters for this subject
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('class_id, user_id')
      .eq('id', params.subjectId)
      .single()

    if (subjectError || !subjectData) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // If subject is global, only subject owner can create chapters
    if (!subjectData.class_id) {
      if (subjectData.user_id !== user.id) {
        return NextResponse.json({ error: 'Only subject owners can create chapters' }, { status: 403 })
      }
    } else {
      // If subject has class, only class owner can create chapters
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('owner_id')
        .eq('id', subjectData.class_id)
        .single()

      if (classError || !classData) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 })
      }

      if (classData.owner_id !== user.id) {
        return NextResponse.json({ error: 'Only class owners can create chapters' }, { status: 403 })
      }
    }

    const { title } = await request.json()

    // Get next chapter number
    const { data: nextNumber, error: numberError } = await supabase
      .rpc('get_next_chapter_number', { subject_uuid: params.subjectId })

    if (numberError) {
      console.error('Error getting next chapter number:', numberError)
      return NextResponse.json({ error: 'Failed to generate chapter number' }, { status: 500 })
    }

    // Create chapter
    const { data: chapter, error: insertError } = await supabase
      .from('chapters')
      .insert({
        subject_id: params.subjectId,
        chapter_number: nextNumber,
        title,
        ai_summary: null, // Will be generated later
        summary_overridden: false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating chapter:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      ...chapter,
      subchapter_count: 0
    })
  } catch (error) {
    console.error('Unexpected error in chapters POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}