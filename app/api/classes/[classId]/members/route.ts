import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

// GET all members for a specific class
export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const classId = params.classId;
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        }
      }
    }
  )

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Security check: Ensure the requesting user is the owner of the class or a member
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('user_id')
    .eq('id', classId)
    .single();

  if (classError || !classData) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  let isMemberOrOwner = classData.user_id === session.user.id;

  if (!isMemberOrOwner) {
    const { data: memberData, error: memberError } = await supabase
        .from('class_members')
        .select()
        .eq('class_id', classId)
        .eq('user_id', session.user.id)
        .single();
    if (!memberError && memberData) {
        isMemberOrOwner = true;
    }
  }

  if (!isMemberOrOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch all user IDs from the class_members table for the given class
  const { data: memberRelations, error: membersError } = await supabase
    .from('class_members')
    .select('user_id')
    .eq('class_id', classId);

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  if (!memberRelations || memberRelations.length === 0) {
    return NextResponse.json([]);
  }

  const userIds = memberRelations.map(m => m.user_id);

  // Fetch the profile information for each user ID
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

    // Fetch user emails from auth.users (requires admin client)
    const supabaseAdmin = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          }
        }
      }
    );
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (profilesError || usersError) {
      return NextResponse.json({ error: profilesError?.message || usersError?.message }, { status: 500 });
    }

  // Combine profile data with email from auth.users
  const students = usersData.users
    .filter(user => userIds.includes(user.id))
    .map(user => {
        const profile = profiles?.find(p => p.id === user.id);
        return {
            id: user.id,
            name: profile?.full_name,
            email: user.email,
            avatarUrl: profile?.avatar_url,
            overallProgress: 0, // Placeholder progress
        };
    });


  return NextResponse.json(students);
}
