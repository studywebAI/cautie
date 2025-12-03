
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

// GET all assignments for the classes owned by the logged-in user OR assignments for classes they are a member of
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const guestId = searchParams.get('guestId');
  
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session && !guestId) {
    return NextResponse.json([]);
  }

  // Get owned class IDs either by user ID or guest ID
  let ownedClassIds: string[] = [];
  if (session) {
    const { data: userClasses, error: ownedError } = await supabase
      .from('classes')
      .select('id')
      .or(`owner_id.eq.${session.user.id},user_id.eq.${session.user.id}`);

    if (ownedError) {
      return NextResponse.json({ error: ownedError.message }, { status: 500 });
    }
    ownedClassIds = userClasses.map(c => c.id);

    // Get member class IDs only for authenticated users
    const { data: memberClasses, error: memberError } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('user_id', session.user.id);

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
  const { title, due_date, class_id, material_id, guestId } = await request.json();
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !guestId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check ownership by either user ID or guest ID
  if (user) {
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('owner_id, user_id')
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

  const { data, error } = await supabase
    .from('assignments')
    .insert([{
      title, 
      due_date, 
      class_id, 
      material_id,
      owner_id: user?.id || null,
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
