import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET assignments for a paragraph
export async function GET(
  request: Request,
  { params }: { params: { subjectId: string; chapterId: string; paragraphId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify access to the paragraph
    const { data: paragraphData, error: paragraphError } = await supabase
      .from('paragraphs')
      .select(`
        *,
        chapters!inner(
          subject_id,
          subjects!inner(class_id, user_id)
        )
      `)
      .eq('id', params.paragraphId)
      .eq('chapters.subject_id', params.subjectId)
      .single()

    if (paragraphError || !paragraphData) {
      return NextResponse.json({ error: 'Paragraph not found' }, { status: 404 })
    }

    const subjectData = paragraphData.chapters.subjects as any
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

    // Get assignments for this paragraph
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select(`
        *,
        blocks (
          id,
          type,
          position
        )
      `)
      .eq('paragraph_id', params.paragraphId)
      .order('assignment_index', { ascending: true })

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      return NextResponse.json({ error: assignmentsError.message }, { status: 500 })
    }

    // Transform assignments to include letter indexing
    const transformedAssignments = (assignments || []).map(assignment => {
      // Call the database function to get letter index
      // For now, we'll compute it in JS since the function isn't available in this context
      const getLetterIndex = (index: number) => {
        if (index === 0) return 'a';
        let result = '';
        let num = index;
        while (num >= 0) {
          result = String.fromCharCode(97 + (num % 26)) + result;
          num = Math.floor(num / 26) - 1;
          if (num < 0) break;
        }
        return result;
      };

      return {
        ...assignment,
        letter_index: getLetterIndex(assignment.assignment_index),
        block_count: assignment.blocks?.length || 0
      };
    })

    return NextResponse.json(transformedAssignments)
  } catch (error) {
    console.error('Unexpected error in assignments GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new assignment
export async function POST(
  request: Request,
  { params }: { params: { subjectId: string; chapterId: string; paragraphId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify access to the paragraph
    const { data: paragraphData, error: paragraphError } = await supabase
      .from('paragraphs')
      .select(`
        *,
        chapters!inner(
          subject_id,
          subjects!inner(class_id, user_id)
        )
      `)
      .eq('id', params.paragraphId)
      .eq('chapters.subject_id', params.subjectId)
      .single()

    if (paragraphError || !paragraphData) {
      return NextResponse.json({ error: 'Paragraph not found' }, { status: 404 })
    }

    const subjectData = paragraphData.chapters.subjects as any
    const classId = subjectData.class_id

    // Check permissions
    if (classId) {
      // Subject associated with class - class owner can create assignments
      const { data: classAccess, error: classError } = await supabase
        .from('classes')
        .select('owner_id')
        .eq('id', classId)
        .single()

      if (classError || !classAccess) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 })
      }

      if (classAccess.owner_id !== user.id) {
        return NextResponse.json({ error: 'Only class owners can create assignments' }, { status: 403 })
      }
    } else {
      // Global subject - only subject owner can create assignments
      if (subjectData.user_id !== user.id) {
        return NextResponse.json({ error: 'Only subject owners can create assignments' }, { status: 403 })
      }
    }

    const { title, answers_enabled = false } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Get next assignment index
    const { data: nextIndex, error: indexError } = await supabase
      .rpc('get_next_assignment_index', { paragraph_uuid: params.paragraphId })

    if (indexError) {
      console.error('Error getting next assignment index:', indexError)
      return NextResponse.json({ error: 'Failed to generate assignment index' }, { status: 500 })
    }

    // Create assignment
    const { data: assignment, error: insertError } = await supabase
      .from('assignments')
      .insert({
        paragraph_id: params.paragraphId,
        assignment_index: nextIndex,
        title: title.trim(),
        answers_enabled,
        class_id: classId // Optional - can be null for global subjects
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating assignment:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Calculate letter index
    const getLetterIndex = (index: number) => {
      if (index === 0) return 'a';
      let result = '';
      let num = index;
      while (num >= 0) {
        result = String.fromCharCode(97 + (num % 26)) + result;
        num = Math.floor(num / 26) - 1;
        if (num < 0) break;
      }
      return result;
    };

    return NextResponse.json({
      ...assignment,
      letter_index: getLetterIndex(assignment.assignment_index),
      block_count: 0
    })
  } catch (error) {
    console.error('Unexpected error in assignments POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}