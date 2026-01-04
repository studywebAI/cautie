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

    // Get user profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || 'student'

    // Get all class IDs the user has access to
    let accessibleClassIds: string[] = []

    if (userRole === 'teacher') {
      // Teachers see subjects for classes they own OR teach in
      const { data: ownedClasses } = await supabase
        .from('classes')
        .select('id')
        .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)

      const { data: taughtClasses } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('user_id', user.id)
        .eq('role', 'teacher')

      const ownedIds = ((ownedClasses as any[]) || []).map(c => c.id)
      const taughtIds = ((taughtClasses as any[]) || []).map(c => c.class_id)
      accessibleClassIds = [...new Set([...ownedIds, ...taughtIds])]
    } else {
      // Students see subjects for classes they are members of
      const { data: memberClasses } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('user_id', user.id)

      accessibleClassIds = ((memberClasses as any[]) || []).map(c => c.class_id)
    }

    // Get subjects for accessible classes
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('id, title, class_id, cover_type, cover_image_url, created_at, user_id, class_label, ai_icon_seed')
      .in('class_id', accessibleClassIds)
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
      title: subject.title,
      name: subject.title,
      class_id: subject.class_id,
      class_label: classMap[subject.class_id] || 'Unknown Class',
      class_name: classMap[subject.class_id] || 'Unknown Class',
      cover_type: subject.cover_type,
      cover_image_url: subject.cover_image_url,
      ai_icon_seed: subject.ai_icon_seed,
      created_at: subject.created_at,
      content: {
        class_label: classMap[subject.class_id] || 'Unknown Class',
        cover_type: subject.cover_type,
        cover_image_url: subject.cover_image_url,
        ai_icon_seed: subject.ai_icon_seed
      },
      recentParagraphs: []
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

    // Get class name for the response
    const { data: classInfo } = await supabase
      .from('classes')
      .select('name')
      .eq('id', class_id)
      .single()

    // Transform to match expected format
    const subjectData = subject as any
    return NextResponse.json({
      id: subjectData.id,
      title: subjectData.title,
      name: subjectData.title,
      class_id: subjectData.class_id,
      class_label: classInfo?.name || 'Unknown Class',
      class_name: classInfo?.name || 'Unknown Class',
      cover_type: subjectData.cover_type,
      cover_image_url: subjectData.cover_image_url,
      ai_icon_seed: subjectData.ai_icon_seed,
      created_at: subjectData.created_at,
      content: {
        class_label: classInfo?.name || 'Unknown Class',
        cover_type: subjectData.cover_type,
        cover_image_url: subjectData.cover_image_url,
        ai_icon_seed: subjectData.ai_icon_seed
      },
      recentParagraphs: []
    })
  } catch (error) {
    console.error('Unexpected error in subjects POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}