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
      const { data: memberData } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('class_id', params.classId)
        .eq('user_id', user.id)
        .single()

      if (!memberData) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Get subjects for this class with basic chapter info for preview
    const { data: subjects, error } = await supabase
      .from('materials') // Using existing materials table for now
      .select(`
        id,
        title,
        type,
        created_at,
        chapters:materials_chapters(*),
        content
      `)
      .eq('class_id', params.classId)
      .eq('type', 'SUBJECT') // We'll create a new type for subjects
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subjects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(subjects || [])
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