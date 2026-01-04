import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser();
  const { searchParams } = new URL(request.url);
  const guestId = searchParams.get('guestId');
  const includeArchived = searchParams.get('includeArchived') === 'true';

  if (!user && !guestId) {
    return NextResponse.json([]);
  }

  // Get classes the user owns
  let ownedClasses: any[] = [];
  if (user) {
    let query = supabase
      .from('classes')
      .select('*')
      .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`);

    // Exclude archived classes unless explicitly requested
    if (!includeArchived) {
      query = query.or('status.is.null,status.neq.archived');
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    ownedClasses = data || [];
  } else if (guestId) {
    let query = supabase
      .from('classes')
      .select('*')
      .eq('guest_id', guestId);

    // Exclude archived classes unless explicitly requested
    if (!includeArchived) {
      query = query.or('status.is.null,status.neq.archived');
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    ownedClasses = data || [];
  }

  let memberClasses: any[] = [];
  if (user) {
    const { data: memberClassesData, error: memberError } = await supabase
      .from('class_members')
      .select('classes(*)')
      .eq('user_id', user.id);

    if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });

    memberClasses = memberClassesData?.map((member: any) => member.classes) || [];
  }

  const allClasses = [...ownedClasses, ...memberClasses];
  const uniqueClasses = Array.from(new Map(allClasses.map(c => [c.id, c])).values());

  return NextResponse.json(uniqueClasses);
  } catch (err) {
    console.error('Unexpected error in classes GET:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/classes called');
    const { name, description, guestId } = await request.json();
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    console.log('User:', user?.id, 'GuestId:', guestId);

    if (!user && !guestId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate unique join code instantly using database function (PERFORMANCE FIX #1)
    const { data: joinCode, error: codeError } = await supabase.rpc('generate_join_code');
    if (codeError || !joinCode) {
       console.error('Join code generation error:', codeError);
       return NextResponse.json({ error: 'Failed to generate join code' }, { status: 500 });
    }

    // Cast to correct insert type
    const insertData = {
      name,
      description,
      join_code: joinCode,
      user_id: user?.id || null,
      guest_id: guestId || null,
      owner_id: user?.id || null,
      owner_type: (user ? 'user' : 'guest') as 'user' | 'guest'
    };

    console.log('Inserting data:', insertData);

    const { data, error } = await supabase
      .from('classes')
      .insert([insertData])
      .select('id, name, description, join_code')
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Insert successful:', data);

    return NextResponse.json(data);
  } catch (err) {
    console.error('Unexpected error in classes POST:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}