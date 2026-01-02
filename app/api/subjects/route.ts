import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/subjects - Get all subjects (global study materials)
export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get materials that can be used as study materials
    const { data: subjects, error } = await supabase
      .from('materials')
      .select('id, title, description, created_at, user_id, is_public')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subjects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to match expected format
    const transformedSubjects = (subjects || []).map(subject => ({
      id: subject.id,
      name: subject.title,
      description: subject.description,
      is_public: subject.is_public,
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

    const { name, description, is_public } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Subject name is required' }, { status: 400 })
    }

    const { data: subject, error: insertError } = await supabase
      .from('materials')
      .insert([{
        title: name.trim(),
        description: description?.trim(),
        type: 'study_material',
        content: { type: 'study_material' }, // Empty content for now
        is_public: is_public || false,
        user_id: user.id
      }])
      .select('id, title, description, created_at, user_id, is_public')
      .single()

    if (insertError) {
      console.error('Error creating subject:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Transform to match expected format
    return NextResponse.json({
      id: subject.id,
      name: subject.title,
      description: subject.description,
      is_public: subject.is_public,
      created_at: subject.created_at
    })
  } catch (error) {
    console.error('Unexpected error in subjects POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}