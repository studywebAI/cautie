import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// PUT - Update a specific block
export async function PUT(
  request: Request,
  { params }: { params: { subjectId: string; chapterId: string; paragraphId: string; assignmentId: string; blockId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: newData } = await request.json()

    // Verify the block belongs to this assignment and user has access
    const { data: block, error: blockError } = await supabase
      .from('blocks')
      .select('assignment_id')
      .eq('id', params.blockId)
      .single()

    if (blockError || !block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    if (block.assignment_id !== params.assignmentId) {
      return NextResponse.json({ error: 'Block does not belong to this assignment' }, { status: 403 })
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
      return NextResponse.json({ error: 'Access denied - only teachers can update blocks' }, { status: 403 })
    }

    // Update the block
    const { data: updatedBlock, error: updateError } = await supabase
      .from('blocks')
      .update({ data: newData })
      .eq('id', params.blockId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating block:', updateError)
      return NextResponse.json({ error: 'Failed to update block' }, { status: 500 })
    }

    return NextResponse.json(updatedBlock)
  } catch (error) {
    console.error('Unexpected error in block PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE a specific block
export async function DELETE(
  request: Request,
  { params }: { params: { subjectId: string; chapterId: string; paragraphId: string; assignmentId: string; blockId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the block belongs to this assignment and user has access
    const { data: block, error: blockError } = await supabase
      .from('blocks')
      .select('assignment_id')
      .eq('id', params.blockId)
      .single()

    if (blockError || !block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    if (block.assignment_id !== params.assignmentId) {
      return NextResponse.json({ error: 'Block does not belong to this assignment' }, { status: 403 })
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
      return NextResponse.json({ error: 'Access denied - only teachers can delete blocks' }, { status: 403 })
    }

    // Delete the block
    const { error: deleteError } = await supabase
      .from('blocks')
      .delete()
      .eq('id', params.blockId)

    if (deleteError) {
      console.error('Error deleting block:', deleteError)
      return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Block deleted successfully' })
  } catch (error) {
    console.error('Unexpected error in block DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}