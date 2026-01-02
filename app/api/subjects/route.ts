import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/subjects - Get all subjects for classes the user has access to
export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get subjects for classes the user owns
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('id, title, class_id, cover_type, cover_image_url, created_at, user_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subjects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get class names for the subjects
    const classIds = [...new Set(((subjects as any[]) || []).map((s: any) => s.class_id))]
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('id, name')
      .in('id', classIds)

    const classMap = ((classes as any[]) || []).reduce((acc, cls) => {
      acc[cls.id] = cls.name
      return acc
    }, {} as Record<string, string>)

    // Transform to match expected format
    const transformedSubjects = ((subjects as any[]) || []).map((subject: any) => ({
      id: subject.id,
      name: subject.title,
      class_id: subject.class_id,
      class_name: classMap[subject.class_id] || 'Unknown Class',
      cover_type: subject.cover_type,
      cover_image_url: subject.cover_image_url,
      created_at: subject.created_at
    }))

    return NextResponse.json(transformedSubjects)
  } catch (error) {
    console.error('Unexpected error in subjects GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/subjects - Create a new global subject
export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, class_id, cover_image_url, cover_type } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Subject name is required' }, { status: 400 })
    }

    if (!class_id) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    // Verify user owns or teaches the class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, user_id, owner_id')
      .eq('id', class_id)
      .single()

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    if (classData.user_id !== user.id && classData.owner_id !== user.id) {
      return NextResponse.json({ error: 'You do not have permission to create subjects for this class' }, { status: 403 })
    }

    const { data: subject, error: insertError } = await supabase
      .from('subjects')
      .insert([{
        title: name.trim(),
        class_id: class_id,
        cover_type: cover_type || 'ai_icons',
        cover_image_url: cover_image_url || null,
        user_id: user.id
      }])
      .select('id, title, class_id, cover_type, cover_image_url, created_at, user_id, class_label')
      .single()

    if (insertError) {
      console.error('Error creating subject:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Transform to match expected format
    const subjectData = subject as any
    return NextResponse.json({
      id: subjectData.id,
      name: subjectData.title,
      class_id: subjectData.class_id,
      cover_type: subjectData.cover_type,
      cover_image_url: subjectData.cover_image_url,
      created_at: subjectData.created_at
    })
  } catch (error) {
    console.error('Unexpected error in subjects POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}