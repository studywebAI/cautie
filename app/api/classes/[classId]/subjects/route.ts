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

    // TEMPORARILY DISABLE AUTHORIZATION FOR TESTING
    console.log('TEMP: GET authorization disabled for testing')

    // Get subjects with progress data
    console.log('Fetching subjects for classId:', params.classId)
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .eq('class_id', params.classId)
      .order('created_at', { ascending: false })

    console.log('Subjects query result:', { subjects, subjectsCount: subjects?.length, error: subjectsError })

    // Also check total subjects in DB to see if any exist
    const { data: allSubjects, error: allError } = await supabase
      .from('subjects')
      .select('id, class_id, title')
      .limit(10)

    console.log('All subjects in DB (first 10):', { allSubjects, allError })

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError)
      return NextResponse.json({ error: subjectsError.message }, { status: 500 })
    }

    // For now, return basic subject data without complex progress calculation
    // This will be enhanced after the hierarchical schema is applied
    const transformedSubjects = subjects?.map(subject => ({
      id: subject.id,
      title: subject.title,
      class_label: subject.class_label || subject.title,
      cover_type: subject.cover_type,
      cover_image_url: subject.cover_image_url,
      ai_icon_seed: subject.ai_icon_seed,
      created_at: subject.created_at,
      content: {
        class_label: subject.class_label || subject.title,
        cover_type: subject.cover_type,
        cover_image_url: subject.cover_image_url,
        ai_icon_seed: subject.ai_icon_seed
      },
      recentParagraphs: [] // Empty for now until schema is migrated
    })) || []

    return NextResponse.json(transformedSubjects)
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

    // TEMPORARILY DISABLE AUTHORIZATION FOR TESTING
    console.log('TEMP: Authorization disabled for testing subjects creation')

    const { title, class_label, cover_type, cover_image_url } = await request.json()
    console.log('Creating subject for classId:', params.classId, { title, class_label, cover_type, cover_image_url })

    // Insert real subject into database
    const subjectData = {
      class_id: params.classId,
      user_id: user.id,
      title,
      class_label: class_label || title,
      cover_type: cover_type || 'ai_icons',
      cover_image_url,
      ai_icon_seed: Math.random().toString(36).substring(2, 15)
    }
    console.log('Inserting subject data:', subjectData)

    const { data: subject, error: insertError } = await supabase
      .from('subjects')
      .insert([subjectData])
      .select()
      .single()

    console.log('Subject creation result:', { subject, error: insertError })

    // Double-check if subject was actually inserted
    if (subject && !insertError) {
      const { data: verifySubject, error: verifyError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subject.id)
        .single()

      console.log('Verification - subject exists in DB:', { verifySubject, verifyError })
    }

    if (insertError) {
      console.error('Error creating subject:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      id: subject.id,
      title: subject.title,
      class_label: subject.class_label || subject.title,
      cover_type: subject.cover_type,
      cover_image_url: subject.cover_image_url,
      ai_icon_seed: subject.ai_icon_seed,
      created_at: subject.created_at,
      content: {
        class_label: subject.class_label || subject.title,
        cover_type: subject.cover_type,
        cover_image_url: subject.cover_image_url,
        ai_icon_seed: subject.ai_icon_seed
      }
    })
  } catch (error) {
    console.error('Unexpected error in subjects POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}