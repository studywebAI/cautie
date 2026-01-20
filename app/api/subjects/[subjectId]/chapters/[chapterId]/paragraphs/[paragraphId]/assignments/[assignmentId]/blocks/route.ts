import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET blocks for an assignment
export async function GET(
  request: Request,
  { params }: { params: { subjectId: string; chapterId: string; paragraphId: string; assignmentId: string } }
) {
  console.log(`GET /api/subjects/[subjectId]/chapters/[chapterId]/paragraphs/[paragraphId]/assignments/${params.assignmentId}/blocks - Called`);

  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log(`Auth check: user=${user?.id}, error=${authError?.message}`);

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

    console.log(`Assignment lookup: id=${params.assignmentId}, error=${assignmentError?.message}, found=${!!assignment}`);

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const subjectData = assignment.paragraphs.chapters.subjects as any
    const classId = subjectData.class_id
    console.log(`Subject data: classId=${classId}, userId=${subjectData.user_id}, currentUser=${user.id}`);

    // Check access permissions
    if (classId) {
      // Subject associated with class
      const { data: classAccess, error: classError } = await supabase
        .from('classes')
        .select('owner_id')
        .eq('id', classId)
        .single()

      console.log(`Class lookup: id=${classId}, error=${classError?.message}, owner=${classAccess?.owner_id}`);

      if (classError || !classAccess) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 })
      }

      const isOwner = classAccess.owner_id === user.id
      console.log(`Permission check: isOwner=${isOwner}, classOwner=${classAccess.owner_id}, userId=${user.id}`);

      if (!isOwner) {
        const { data: memberData, error: memberError } = await supabase
          .from('class_members')
          .select('class_id')
          .eq('class_id', classId)
          .eq('user_id', user.id)
          .single()

        console.log(`Member check: classId=${classId}, userId=${user.id}, error=${memberError?.message}, isMember=${!!memberData}`);

        if (memberError || !memberData) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      }
    } else {
      // Global subject
      const isOwner = subjectData.user_id === user.id
      console.log(`Global subject check: subjectOwner=${subjectData.user_id}, userId=${user.id}, isOwner=${isOwner}`);

      if (!isOwner) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Get blocks for this assignment
    console.log(`Fetching blocks for assignment: ${params.assignmentId}`);
    const { data: blocks, error: blocksError } = await supabase
      .from('blocks')
      .select('*')
      .eq('assignment_id', params.assignmentId)
      .order('position', { ascending: true })

    console.log(`Blocks query result: count=${blocks?.length || 0}, error=${blocksError?.message}`);

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError)
      return NextResponse.json({ error: 'Failed to fetch blocks', details: blocksError.message }, { status: 500 })
    }

    console.log(`Returning ${blocks.length} blocks`);
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
  console.log(`POST /api/subjects/[subjectId]/chapters/[chapterId]/paragraphs/[paragraphId]/assignments/${params.assignmentId}/blocks - Called`);

  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log(`Auth check: user=${user?.id}, error=${authError?.message}`);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, position, data: blockData } = body

    if (!type || position === undefined || !blockData) {
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

    console.log(`Assignment lookup: id=${params.assignmentId}, error=${assignmentError?.message}, found=${!!assignment}`);

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const subjectData = assignment.paragraphs.chapters.subjects as any
    const classId = subjectData.class_id
    console.log(`Subject data: classId=${classId}, userId=${subjectData.user_id}, currentUser=${user.id}`);

    // Check if user is teacher/owner
    let isTeacher = false
    if (classId) {
      // Subject associated with class
      const { data: classAccess, error: classError } = await supabase
        .from('classes')
        .select('owner_id')
        .eq('id', classId)
        .single()

      console.log(`Class lookup: id=${classId}, error=${classError?.message}, owner=${classAccess?.owner_id}`);

      if (classError || !classAccess) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 })
      }

      isTeacher = classAccess.owner_id === user.id
      console.log(`Teacher check: isTeacher=${isTeacher}, classOwner=${classAccess.owner_id}, userId=${user.id}`);
    } else {
      // Global subject
      isTeacher = subjectData.user_id === user.id
      console.log(`Global subject teacher check: subjectOwner=${subjectData.user_id}, userId=${user.id}, isTeacher=${isTeacher}`);
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
        data: blockData
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating block:', insertError)
      return NextResponse.json({ error: 'Failed to create block' }, { status: 500 })
    }

    console.log(`Block created successfully: ${newBlock.id}`);
    return NextResponse.json(newBlock)
  } catch (error) {
    console.error('Unexpected error in blocks POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

