
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function PUT(request: Request) {
  const { userId, newRole } = await request.json();

  if (!userId || !newRole) {
    return NextResponse.json({ error: 'Missing userId or newRole' }, { status: 400 });
  }

  // This uses the anon key, which is NOT ideal for production but okay for prototype.
  // In a real app, you'd use a service role key or validate with RLS.
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating profile role:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Profile not found or not updated' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    console.error('Unexpected error updating profile role:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
