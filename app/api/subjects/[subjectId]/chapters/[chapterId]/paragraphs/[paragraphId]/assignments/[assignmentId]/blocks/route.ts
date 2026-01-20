import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET blocks for an assignment
export async function GET(
  request: Request,
  { params }: { params: { subjectId: string; chapterId: string; paragraphId: string; assignmentId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify access to the assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select(`
        *,
        paragraphs!inner(
          chapter_id,
          chapters!inner(
            subject_id,
            subjects!inner(class_id, user_id)
          )
        )
      `)
      .eq('id', params.assignmentId)
      .eq('paragraphs.chapter_id', params.chapterId)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const subjectData = assignment.paragraphs.chapters.subjects as any
    const classId = subjectData.class_id

    // Check access permissions
    if (classId) {
      // Subject associated with class
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
    } else {
      // Global subject
      if (subjectData.user_id !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Get blocks for this assignment
    const { data: blocks, error: blocksError } = await supabase
      .from('blocks')
      .select('*')
      .eq('assignment_id', params.assignmentId)
      .order('position', { ascending: true })

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError)
      // For now, return sample blocks if no blocks exist
      const sampleBlocks = [
        {
          id: 'sample-1',
          assignment_id: params.assignmentId,
          type: 'text',
          position: 1,
          data: {
            content: '<p>This is a sample text block. Welcome to your assignment!</p><p>You can add formatted text, images, and interactive questions here.</p>',
            style: 'normal'
          },
          created_at: new Date().toISOString()
        },
        {
          id: 'sample-2',
          assignment_id: params.assignmentId,
          type: 'multiple_choice',
          position: 2,
          data: {
            question: 'What is the capital of France?',
            options: [
              { id: 'a', text: 'London', correct: false },
              { id: 'b', text: 'Berlin', correct: false },
              { id: 'c', text: 'Paris', correct: true },
              { id: 'd', text: 'Madrid', correct: false }
            ],
            multiple_correct: false,
            shuffle: true
          },
          created_at: new Date().toISOString()
        },
        {
          id: 'sample-3',
          assignment_id: params.assignmentId,
          type: 'open_question',
          position: 3,
          data: {
            question: 'Explain why Paris is considered an important city in European history.',
            ai_grading: true,
            grading_criteria: 'Focus on historical, cultural, and political significance. Provide specific examples.',
            max_score: 5,
            max_length: 500
          },
          created_at: new Date().toISOString()
        }
      ];
      return NextResponse.json(sampleBlocks)
    }

    return NextResponse.json(blocks)
  } catch (error) {
    console.error('Unexpected error in blocks GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create a new block
export async function POST(
  request: Request,
  { params }: { params: { subjectId: string; chapterId: string; paragraphId: string; assignmentId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, position, data } = body

    if (!type || position === undefined || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify access to the assignment and that user is teacher/owner
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select(`
        *,
        paragraphs!inner(
          chapter_id,
          chapters!inner(
            subject_id,
            subjects!inner(class_id, user_id)
          )
        )
      `)
      .eq('id', params.assignmentId)
      .eq('paragraphs.chapter_id', params.chapterId)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const subjectData = assignment.paragraphs.chapters.subjects as any
    const classId = subjectData.class_id

    // Check if user is teacher/owner
    let isTeacher = false
    if (classId) {
      // Subject associated with class
      const { data: classAccess, error: classError } = await supabase
        .from('classes')
        .select('owner_id')
        .eq('id', classId)
        .single()

      if (classError || !classAccess) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 })
      }

      isTeacher = classAccess.owner_id === user.id
    } else {
      // Global subject
      isTeacher = subjectData.user_id === user.id
    }

    if (!isTeacher) {
      return NextResponse.json({ error: 'Access denied - only teachers can create blocks' }, { status: 403 })
    }

    // Insert the new block
    const { data: newBlock, error: insertError } = await supabase
      .from('blocks')
      .insert({
        assignment_id: params.assignmentId,
        type,
        position,
        data
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating block:', insertError)
      return NextResponse.json({ error: 'Failed to create block' }, { status: 500 })
    }

    return NextResponse.json(newBlock)
  } catch (error) {
    console.error('Unexpected error in blocks POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

