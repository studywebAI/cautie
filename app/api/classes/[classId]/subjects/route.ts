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
      .select('id')
      .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)

    if (classError || !classAccess?.some(c => c.id === params.classId)) {
      // Check if user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('class_id', params.classId)
        .eq('user_id', user.id)
        .single()

      if (memberError || !memberData) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // For now, return mock subjects with realistic progress data
    // TODO: Replace with real database queries once subjects table is deployed
    const mockSubjects = [
      {
        id: 'subj-1',
        title: 'Mathematics',
        class_label: 'Mathematics A1',
        cover_type: 'ai_icons',
        cover_image_url: null,
        ai_icon_seed: 'math123',
        created_at: new Date().toISOString(),
        content: {
          class_label: 'Mathematics A1',
          cover_type: 'ai_icons',
          cover_image_url: null,
          ai_icon_seed: 'math123'
        },
        recentParagraphs: [
          { id: 'para-1-1', title: 'Basic Algebra', progress: 85 },
          { id: 'para-1-2', title: 'Equations & Inequalities', progress: 62 },
          { id: 'para-1-3', title: 'Functions', progress: 34 }
        ]
      },
      {
        id: 'subj-2',
        title: 'Dutch Language',
        class_label: 'Nederlands B2',
        cover_type: 'ai_icons',
        cover_image_url: null,
        ai_icon_seed: 'dutch456',
        created_at: new Date().toISOString(),
        content: {
          class_label: 'Nederlands B2',
          cover_type: 'ai_icons',
          cover_image_url: null,
          ai_icon_seed: 'dutch456'
        },
        recentParagraphs: [
          { id: 'para-2-1', title: 'Grammar Fundamentals', progress: 91 },
          { id: 'para-2-2', title: 'Vocabulary Building', progress: 78 },
          { id: 'para-2-3', title: 'Reading Comprehension', progress: 45 }
        ]
      }
    ]

    return NextResponse.json(mockSubjects)
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

    // For now, return a mock subject response to simulate successful creation
    // TODO: Replace with real database insertion once subjects table is deployed
    const mockSubject = {
      id: `subj-${Date.now()}`,
      title,
      class_label: class_label || title,
      cover_type: cover_type || 'ai_icons',
      cover_image_url,
      ai_icon_seed: Math.random().toString(36).substring(2, 15),
      created_at: new Date().toISOString(),
      content: {
        class_label: class_label || title,
        cover_type: cover_type || 'ai_icons',
        cover_image_url,
        ai_icon_seed: Math.random().toString(36).substring(2, 15)
      }
    }

    return NextResponse.json(mockSubject)
  } catch (error) {
    console.error('Unexpected error in subjects POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}