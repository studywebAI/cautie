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

  // Get assignments through the hierarchical structure:
  // classes -> subjects -> chapters -> paragraphs -> assignments
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      paragraphs!inner (
        chapters!inner (
          subjects!inner (
            class_id
          )
        )
      )
    `)
    .in('paragraphs.chapters.subjects.class_id', ownedClassIds);

  if (error) {
    console.error('Error fetching assignments for classes:', ownedClassIds, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data)
}

// POST a new assignment - DISABLED until API is updated for hierarchical structure
export async function POST(request: Request) {
  return NextResponse.json({ error: 'Assignment creation disabled - API needs update for hierarchical structure' }, { status: 501 });
}

