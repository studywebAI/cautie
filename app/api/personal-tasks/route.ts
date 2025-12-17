
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

// GET all personal tasks for the logged-in user
export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(`n    process.env.NEXT_PUBLIC_SUPABASE_URL!,`n    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,`n    { cookies: () => cookieStore }`n  );

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

// POST a new personal task
export async function POST(request: Request) {
  const { title, description, date, subject } = await request.json();
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(`n    process.env.NEXT_PUBLIC_SUPABASE_URL!,`n    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,`n    { cookies: () => cookieStore }`n  );
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('personal_tasks')
    .insert([
      { title, description, date, subject, user_id: user.id },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating personal task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
