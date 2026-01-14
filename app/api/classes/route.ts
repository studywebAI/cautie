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
    // Get GLOBAL user role from profiles table (website-wide teacher/student mode)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const userRole = profile?.role || 'student'; // Default to student if no profile exists
    const isTeacher = userRole === 'teacher';

    console.log('DEBUG: Global user role from profiles:', userRole, 'isTeacher:', isTeacher);

    if (isTeacher) {
      // TEACHERS: See ALL classes on the website (for management and creation)
      // This allows teachers to see everything and manage the platform
      let query = supabase
        .from('classes')
        .select('*');

      if (!includeArchived) {
        query = query.or('status.is.null,status.neq.archived');
      }

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      allClasses = data || [];
      console.log('DEBUG: Teacher mode - sees ALL classes:', allClasses.length, 'total classes');
    } else {
      // STUDENTS: See classes they own + classes they're members of
      // Students can create their own classes AND join other teachers' classes
      let ownedQuery = supabase
        .from('classes')
        .select('*')
        .eq('owner_id', user.id);

      if (!includeArchived) {
        ownedQuery = ownedQuery.or('status.is.null,status.neq.archived');
      }

      const { data: ownedData, error: ownedError } = await ownedQuery;
      if (ownedError) return NextResponse.json({ error: ownedError.message }, { status: 500 });

      // Get member classes (classes student has joined)
      const { data: memberClassesData, error: memberError } = await supabase
        .from('class_members')
        .select('classes(*)')
        .eq('user_id', user.id);

      if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });

      // Filter out classes where the user is the owner to avoid duplicates
      const memberClasses = memberClassesData?.map((member: any) => member.classes).filter((cls: any) => cls && cls.owner_id !== user.id) || [];

      allClasses = [...(ownedData || []), ...memberClasses];
      console.log('DEBUG: Student mode - owned classes:', ownedData?.length || 0, '+ member classes:', memberClasses.length);
    }

    // Remove duplicates (though there shouldn't be any with the filtering above)
    const uniqueClasses = Array.from(new Map(allClasses.map(c => [c.id, c])).values());
    return NextResponse.json(uniqueClasses);
  } else if (guestId) {
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