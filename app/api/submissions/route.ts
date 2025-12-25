import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/submissions - Get submissions for current user or teacher's assignments
export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is teacher or student
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isTeacher = profile?.role === 'teacher'

    let query = (supabase as any)
      .from('submissions')
      .select(`
        *,
        assignments (
          title,
          class_id,
          classes (
            name,
            owner_id
          )
        ),
        profiles:user_id (
          full_name
        )
      `)

    if (assignmentId) {
      query = query.eq('assignment_id', assignmentId)
    }

    if (!isTeacher) {
      // Students can only see their own submissions
      query = query.eq('user_id', user.id)
    } else {
      // Teachers can see submissions for their assignments
      query = query.in('assignment_id',
        (supabase as any)
          .from('assignments')
          .select('id')
          .in('class_id',
            supabase
              .from('classes')
              .select('id')
              .eq('owner_id', user.id)
          )
      )
    }

    const { data: submissions, error } = await query

    if (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(submissions || [])
  } catch (error) {
    console.error('Unexpected error in submissions GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/submissions - Create or update a submission
export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)
    const { assignmentId, content, files, status = 'submitted' } = await request.json()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is enrolled in the class for this assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('class_id')
      .eq('id', assignmentId)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const { data: membership } = await supabase
      .from('class_members')
      .select('role')
      .eq('class_id', assignment.class_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'You are not enrolled in this class' }, { status: 403 })
    }

    // Check if submission already exists
    const { data: existingSubmission } = await (supabase as any)
      .from('submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('user_id', user.id)
      .single()

    let result
    if (existingSubmission) {
      // Update existing submission
      const { data, error } = await (supabase as any)
        .from('submissions')
        .update({
          content,
          files: files || [],
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubmission.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new submission
      const { data, error } = await (supabase as any)
        .from('submissions')
        .insert({
          assignment_id: assignmentId,
          user_id: user.id,
          content,
          files: files || [],
          status
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Unexpected error in submissions POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}