import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET progress for a specific assignment
export async function GET(
  request: Request,
  { params }: { params: Promise<{ subjectId: string; chapterId: string; paragraphId: string; assignmentId: string }> }
) {
  console.log(`GET /api/subjects/[subjectId]/chapters/[chapterId]/paragraphs/[paragraphId]/assignments/[assignmentId]/progress - Called`);

  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const resolvedParams = await params;
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    // Get current user for permission checks
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If no studentId provided, use current user (for students)
    // Teachers can specify studentId to view specific student's progress
    const targetStudentId = studentId || user.id

    // Check if user has permission to view this progress
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select(`
        id,
        paragraph_id,
        paragraphs!inner (
          chapter_id,
          chapters!inner (
            subject_id,
            subjects!inner (
              class_id,
              classes!inner (
                owner_id,
                class_members!inner (
                  user_id,
                  role
                )
              )
            )
          )
        )
      `)
      .eq('id', resolvedParams.assignmentId)
      .single()

    if (assignmentError) {
      console.log(`Assignment fetch error:`, assignmentError);
      // Check if it's a "not found" error vs other database errors
      if (assignmentError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Check permissions
    const classData = assignment.paragraphs?.chapters?.subjects?.classes
    const isOwner = classData?.owner_id === user.id
    const isTeacher = classData?.class_members?.some((member: any) =>
      member.user_id === user.id && member.role === 'teacher'
    )
    const isStudentViewingOwn = !studentId && targetStudentId === user.id

    if (!isOwner && !isTeacher && !isStudentViewingOwn) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all blocks for this assignment
    const { data: blocks, error: blocksError } = await supabase
      .from('blocks')
      .select('id, type, data')
      .eq('assignment_id', resolvedParams.assignmentId)
      .order('position', { ascending: true })

    if (blocksError) {
      console.log(`Blocks fetch error:`, blocksError);
      return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 })
    }

    const totalBlocks = blocks?.length || 0
    let completedBlocks = 0

    if (totalBlocks > 0) {
      // Fetch student answers for this student and assignment blocks
      const { data: answers, error: answersError } = await supabase
        .from('student_answers')
        .select('block_id, is_correct, score')
        .eq('student_id', targetStudentId)
        .in('block_id', blocks.map(b => b.id))

      if (answersError) {
        console.log(`Answers fetch error:`, answersError);
        // Don't fail if answers can't be fetched, just return 0 progress
      } else {
        // Calculate completion based on answers
        const blockAnswerMap = new Map(answers?.map(a => [a.block_id, a]) || [])

        for (const block of blocks) {
          const answer = blockAnswerMap.get(block.id)

          if (answer) {
            // For multiple choice and fill-in-blank, check is_correct
            if (block.type === 'multiple_choice' || block.type === 'fill_in_blank') {
              if (answer.is_correct) {
                completedBlocks++
              }
            }
            // For open questions, check if score > 0
            else if (block.type === 'open_question') {
              if (answer.score && answer.score > 0) {
                completedBlocks++
              }
            }
            // For other types (drag_drop, ordering), assume completed if answered
            else if (answer.is_correct !== null) {
              if (answer.is_correct) {
                completedBlocks++
              }
            }
          }
        }
      }
    }

    const completionPercent = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0

    const progressData = {
      assignment_id: resolvedParams.assignmentId,
      student_id: targetStudentId,
      total_blocks: totalBlocks,
      completed_blocks: completedBlocks,
      completion_percent: completionPercent,
      is_completed: completionPercent === 100
    }

    console.log(`Progress calculated:`, progressData);
    return NextResponse.json(progressData)

  } catch (err) {
    console.error(`Unexpected error:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}