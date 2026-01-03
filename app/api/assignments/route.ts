import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

// GET all assignments for the classes owned by the logged-in user OR assignments for classes they are a member of
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const guestId = searchParams.get('guestId');

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !guestId) {
    return NextResponse.json([]);
  }

  // Get owned class IDs either by user ID or guest ID
  let ownedClassIds: string[] = [];
  if (user) {
    const { data: userClasses, error: ownedError } = await supabase
      .from('classes')
      .select('id')
      .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`);

    if (ownedError) {
      return NextResponse.json({ error: ownedError.message }, { status: 500 });
    }
    ownedClassIds = userClasses?.map(c => c.id) || [];

    // Get member class IDs only for authenticated users
    const { data: memberClasses, error: memberError } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('user_id', user.id);

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }
    const memberClassIds = memberClasses.map(c => c.class_id);
    ownedClassIds = [...new Set([...ownedClassIds, ...memberClassIds])];
  } else if (guestId) {
    const { data: guestClasses, error: ownedError } = await supabase
      .from('classes')
      .select('id')
      .eq('guest_id', guestId)
      .eq('owner_type', 'guest');

    if (ownedError) {
      return NextResponse.json({ error: ownedError.message }, { status: 500 });
    }
    ownedClassIds = guestClasses.map(c => c.id);
  }

  if (ownedClassIds.length === 0) {
    return NextResponse.json([]);
  }
  const classIds = ownedClassIds;


  if (classIds.length === 0) {
    return NextResponse.json([]);
  }

  // 2. Get assignments that belong to those classes
  const { data, error } = await supabase
    .from('assignments')
    .select()
    .in('class_id', classIds);

  if (error) {
    console.error('Error fetching assignments for classes:', classIds, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data)
}

// POST a new assignment
export async function POST(request: Request) {
  const { title, due_date, class_id, chapter_id, block_id, guestId, type = 'homework', content, files = [], grading_category_id, rubric_id, max_points } = await request.json();
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !guestId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check ownership by either user ID or guest ID
  if (user) {
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('user_id, owner_id')
      .eq('id', class_id)
      .single();

    if (classError || !classData || (classData.user_id !== user.id && classData.owner_id !== user.id)) {
      return NextResponse.json({ error: 'Forbidden. You are not the owner of this class.' }, { status: 403 });
    }
  } else if (guestId) {
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('guest_id')
      .eq('id', class_id)
      .eq('owner_type', 'guest')
      .single();

    if (classError || !classData || classData.guest_id !== guestId) {
      return NextResponse.json({ error: 'Forbidden. You are not the owner of this class.' }, { status: 403 });
    }
  }

  // Validate chapter_id if provided
  if (chapter_id) {
    const { data: chapter, error: chapterError } = await supabase
      .from('class_chapters')
      .select('class_id')
      .eq('id', chapter_id)
      .single();

    if (chapterError || !chapter || chapter.class_id !== class_id) {
      return NextResponse.json({ error: 'Invalid chapter_id' }, { status: 400 });
    }
  }

  // Validate block_id if provided
  if (block_id) {
    const { data: block, error: blockError } = await supabase
      .from('blocks')
      .select('chapter_id')
      .eq('id', block_id)
      .single();

    if (blockError || !block || block.chapter_id !== chapter_id) {
      return NextResponse.json({ error: 'Invalid block_id' }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from('assignments' as any)
    .insert([{
      title,
      due_date,
      class_id,
      chapter_id,
      block_id,
      type,
      content,
      files,
      grading_category_id,
      rubric_id,
      max_points,

      user_id: user?.id || null,
      guest_id: guestId || null,
      owner_type: user ? 'user' : 'guest'
    },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

