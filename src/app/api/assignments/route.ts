
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

// GET all assignments (in a real app, you'd likely filter by user/class)
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data, error } = await supabase.from('assignments').select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data)
}

// POST a new assignment
export async function POST(request: Request) {
  const { title, due_date, class_id } = await request.json();
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
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
