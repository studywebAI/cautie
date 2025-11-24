
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

// GET all assignments for the classes owned by the logged-in user OR assignments for classes they are a member of
export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Get the IDs of all classes the user is a member of (student) or owns (teacher)
  const { data: ownedClasses, error: ownedError } = await supabase
    .from('classes')
    .select('id')
    .eq('owner_id', session.user.id);
  
  if (ownedError) {
    console.error('Error fetching owned classes:', ownedError);
    return NextResponse.json({ error: ownedError.message }, { status: 500 });
  }

  const { data: memberClasses, error: memberError } = await supabase
    .from('class_members')
    .select('class_id')
    .eq('user_id', session.user.id);
  
  if (memberError) {
    console.error('Error fetching member classes:', memberError);
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }
  
  const ownedClassIds = ownedClasses.map(c => c.id);
  const memberClassIds = memberClasses.map(c => c.class_id);
  const classIds = [...new Set([...ownedClassIds, ...memberClassIds])];


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
  const { title, due_date, class_id } = await request.json();
  const cookieStore = cookies();
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Optional: Check if the user is the owner of the class before inserting
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('owner_id')
    .eq('id', class_id)
    .single();

  if (classError || !classData || classData.owner_id !== user.id) {
     return NextResponse.json({ error: 'Forbidden. You are not the owner of this class.' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('assignments')
    .insert([
      { title, due_date, class_id },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
