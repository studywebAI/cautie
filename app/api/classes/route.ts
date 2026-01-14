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

  let allClasses: any[] = [];

  if (user) {
    // Check if user is a teacher from profiles (handle missing profile gracefully)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when no rows

    // If profile doesn't exist or fetch failed, default to student
    const isTeacher = profile?.role === 'teacher';

    console.log('DEBUG: User role from profiles:', profile?.role, 'isTeacher:', isTeacher);

    if (isTeacher) {
      // Teachers only see classes they own
      let query = supabase
        .from('classes')
        .select('*')
        .eq('owner_id', user.id);

      if (!includeArchived) {
        query = query.or('status.is.null,status.neq.archived');
      }

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      allClasses = data || [];
      console.log('DEBUG: Teacher classes (owned only):', allClasses.map(c => ({id: c.id, name: c.name, owner_id: c.owner_id})));
    } else {
      // Students see classes they own + classes they're members of
      // Get owned classes
      let ownedQuery = supabase
        .from('classes')
        .select('*')
        .eq('owner_id', user.id);

      if (!includeArchived) {
        ownedQuery = ownedQuery.or('status.is.null,status.neq.archived');
      }

      const { data: ownedData, error: ownedError } = await ownedQuery;
      if (ownedError) return NextResponse.json({ error: ownedError.message }, { status: 500 });

      // Get member classes
      const { data: memberClassesData, error: memberError } = await supabase
        .from('class_members')
        .select('classes(*)')
        .eq('user_id', user.id);

      if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });

      // Filter out classes where the user is the owner to avoid duplicates
      const memberClasses = memberClassesData?.map((member: any) => member.classes).filter((cls: any) => cls && cls.owner_id !== user.id) || [];

      allClasses = [...(ownedData || []), ...memberClasses];
      console.log('DEBUG: Student classes (owned + member):', allClasses.map(c => ({id: c.id, name: c.name, owner_id: c.owner_id})));
    }

    const uniqueClasses = Array.from(new Map(allClasses.map(c => [c.id, c])).values());
    console.log('DEBUG: Final unique classes:', uniqueClasses.map(c => c.id));

    return NextResponse.json(uniqueClasses);
  } else if (guestId) {
    // Guest user logic (if needed)
    return NextResponse.json([]);
  } else {
    return NextResponse.json([]);
  }
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

    // Only allow authenticated users to create classes
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to create classes' }, { status: 401 });
    }

    // Cast to correct insert type - only use fields that exist in the database schema
    const insertData = {
      name,
      description,
      join_code: joinCode,
      owner_id: user.id
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