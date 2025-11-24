
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { data, error } = await supabase.from('classes').select().eq('owner_id', session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { name, description } = await request.json();
  const cookieStore = cookies();
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('classes')
    .insert([
      { name, description, owner_id: user.id },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
