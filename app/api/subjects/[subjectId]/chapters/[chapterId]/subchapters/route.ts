import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET subchapters for a chapter
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
        subjects!inner(class_id)
      `)
      .eq('id', params.chapterId)
      .eq('subject_id', params.subjectId)
      .single()

    if (chapterError || !chapterData) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    const classId = chapterData.subjects.class_id

    // Check access
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

    // For now, return empty array until database schema is updated
    // The hierarchical structure requires the new database tables to be created
    return NextResponse.json([])

    return NextResponse.json(transformedSubchapters)
  } catch (error) {
    console.error('Unexpected error in subchapters GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new subchapter
export async function POST(
  request: Request,
  { params }: { params: { subjectId: string; chapterId: string } }
) {
  // Return error until database schema is updated
  return NextResponse.json({ error: 'Hierarchical structure not yet implemented. Please run the database migration first.' }, { status: 501 })
}