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

    // Get subjects for this class - for now just return the basic subject data
    // TODO: Implement full hierarchical structure when database schema is updated
    const { data: subjects, error: subjectsError } = await supabase
      .from('materials')
      .select(`
        id,
        title,
        type,
        created_at,
        content
      `)
      .eq('class_id', params.classId)
      .eq('type', 'SUBJECT')
      .order('created_at', { ascending: false })

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError)
      return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
    }

    // For now, return subjects with placeholder progress data
    // This will be replaced with real hierarchical data once deployed
    const subjectsWithProgress = (subjects || []).map(subject => ({
      ...subject,
      // Placeholder data - will be replaced with real chapter/paragraph progress
      recentParagraphs: [
        { id: '1', title: 'Introduction', progress: Math.floor(Math.random() * 100) },
        { id: '2', title: 'Core Concepts', progress: Math.floor(Math.random() * 100) },
        { id: '3', title: 'Practice Exercises', progress: Math.floor(Math.random() * 100) }
      ].slice(0, 3) // Show up to 3 paragraphs
    }))

    return NextResponse.json(subjectsWithProgress || [])
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

    // For now, we'll store subjects as a special type of material
    // Later this can be migrated to a dedicated subjects table
    const { data: subject, error } = await supabase
      .from('materials')
      .insert({
        class_id: params.classId,
        title,
        type: 'SUBJECT',
        content: {
          class_label: class_label || title,
          cover_type: cover_type || 'ai_icons',
          cover_image_url,
          ai_icon_seed: Math.random().toString(36).substring(2, 15)
        },
        user_id: user.id,
        is_public: false
      })
      .select(`
        id,
        title,
        type,
        created_at,
        content
      `)
      .single()

    if (error) {
      console.error('Error creating subject:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(subject)
  } catch (error) {
    console.error('Unexpected error in subjects POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}