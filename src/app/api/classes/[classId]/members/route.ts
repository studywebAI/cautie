
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
  const cookieStore = cookies();
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Security check: Ensure the requesting user is the owner of the class
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('owner_id')
    .eq('id', classId)
    .single();

  if (classError || !classData) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  if (classData.owner_id !== session.user.id) {
    // Also allow members of the class to see other members
     const { data: memberData, error: memberError } = await supabase
        .from('class_members')
        .select()
        .eq('class_id', classId)
        .eq('user_id', session.user.id)
        .single();
    if (memberError || !memberData) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
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
    
   const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
   if (profilesError || usersError) {
     return NextResponse.json({ error: profilesError?.message || usersError?.message }, { status: 500 });
   }

  // Combine profile data with email from auth.users
  const students = users.users
    .filter(user => userIds.includes(user.id))
    .map(user => {
        const profile = profiles.find(p => p.id === user.id);
        return {
            id: user.id,
            name: profile?.full_name,
            email: user.email,
            avatarUrl: profile?.avatar_url,
            overallProgress: Math.floor(Math.random() * 60) + 40, // Placeholder progress
        };
    });


  return NextResponse.json(students);
}
