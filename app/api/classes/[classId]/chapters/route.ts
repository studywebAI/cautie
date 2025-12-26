import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

// GET /api/classes/[classId]/chapters - List chapters for a class
export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const classId = params.classId
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this class (owner or member)
    const { data: accessCheck, error: accessError } = await supabase
      .from('classes')
      .select('user_id')
      .eq('id', classId)
      .single()

    if (accessError || !accessCheck) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const isOwner = accessCheck.user_id === user.id

    if (!isOwner) {
      // Check if user is a member
      const { data: memberCheck, error: memberError } = await supabase
        .from('class_members')
        .select()
        .eq('class_id', classId)
        .eq('user_id', user.id)
        .single()

      if (memberError || !memberCheck) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Get chapters ordered by order_index
    const { data: chapters, error } = await supabase
      .from('class_chapters')
      .select('*')
      .eq('class_id', classId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching chapters:', error)
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 })
    }

    return NextResponse.json({ chapters: chapters || [] })
  } catch (err) {
    console.error('Unexpected error in chapters GET:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/classes/[classId]/chapters - Create a new chapter
export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const classId = params.classId
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is the owner of this class
    const { data: classCheck, error: classError } = await supabase
      .from('classes')
      .select('user_id')
      .eq('id', classId)
      .single()

    if (classError || !classCheck) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    if (classCheck.user_id !== user.id) {
      return NextResponse.json({ error: 'Only class owners can create chapters' }, { status: 403 })
    }

    const { title, description } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Chapter title is required' }, { status: 400 })
    }

    // Get the highest order_index for this class
    const { data: lastChapter } = await supabase
      .from('class_chapters')
      .select('order_index')
      .eq('class_id', classId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = (lastChapter?.order_index || 0) + 1

    const { data: chapter, error } = await supabase
      .from('class_chapters')
      .insert({
        class_id: classId,
        title: title.trim(),
        description: description?.trim(),
        order_index: nextOrderIndex,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating chapter:', error)
      return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 })
    }

    return NextResponse.json({ chapter })
  } catch (err) {
    console.error('Unexpected error in chapters POST:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}