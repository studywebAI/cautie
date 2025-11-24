
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

// POST a new assignment
export async function POST(request: Request) {
  const { class_code } = await request.json();
  const cookieStore = cookies();
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Verify class exists
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('id, owner_id')
    .eq('id', class_code)
    .single();
  
  if (classError || !classData) {
    return NextResponse.json({ error: 'Class not found.' }, { status: 404 });
  }

  // 2. Check if user is the owner (can't join their own class as a student)
  if (classData.owner_id === user.id) {
    return NextResponse.json({ error: 'You are the owner of this class.' }, { status: 400 });
  }

  // 3. Check if user is already a member
  const { data: memberData, error: memberError } = await supabase
    .from('class_members')
    .select()
    .eq('class_id', class_code)
    .eq('user_id', user.id)
    .single();
    
  if (memberData) {
    return NextResponse.json({ error: 'You are already a member of this class.' }, { status: 400 });
  }

  // 4. Insert into class_members table
  const { error: insertError } = await supabase
    .from('class_members')
    .insert([
      { class_id: class_code, user_id: user.id, role: 'student' },
    ]);

  if (insertError) {
    console.error('Error joining class:', insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Successfully joined class', class: classData });
}
