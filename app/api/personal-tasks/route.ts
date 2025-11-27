
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

// GET all personal tasks for the logged-in user
export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // For guests, return an empty array. The client will use local storage.
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from('personal_tasks')
    .select()
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error fetching personal tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data)
}

// POST one or more new personal tasks
export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = cookies();
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if the body contains a 'tasks' array for batch insertion
  const tasksToInsert = body.tasks || [body];

  // Add user_id to each task
  const tasksWithUser = tasksToInsert.map((task: any) => ({ ...task, user_id: user.id }));

  const { data, error } = await supabase
    .from('personal_tasks')
    .insert(tasksWithUser)
    .select();

  if (error) {
    console.error('Error creating personal task(s):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If the original request was for a single task, return a single object
  if (!body.tasks) {
    return NextResponse.json(data[0]);
  }

  // Otherwise, return the array of created tasks
  return NextResponse.json(data);
}
