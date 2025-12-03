import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  const { guestId } = await request.json(); // Expect guestId from the client-side

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!guestId) {
    return NextResponse.json({ error: 'Guest ID is required for migration' }, { status: 400 });
  }

  try {
    // Migrate classes
    await supabase
      .from('classes')
      .update({ user_id: user.id, guest_id: null, owner_type: 'user' } as Database['public']['Tables']['classes']['Update'])
      .eq('guest_id', guestId);

    // Migrate assignments
    await supabase
      .from('assignments')
      .update({ user_id: user.id, guest_id: null, owner_type: 'user' } as Database['public']['Tables']['assignments']['Update'])
      .eq('guest_id', guestId);

    // Add more tables here as needed for migration: personal_tasks, materials, notes
    // Example for personal_tasks:
    await supabase
      .from('personal_tasks')
      .update({ user_id: user.id, guest_id: null, owner_type: 'user' } as Database['public']['Tables']['personal_tasks']['Update'])
      .eq('guest_id', guestId);

    // Example for materials (assuming materials also have guest_id and user_id):
    await supabase
      .from('materials')
      .update({ user_id: user.id, guest_id: null, owner_type: 'user' } as Database['public']['Tables']['materials']['Update'])
      .eq('guest_id', guestId);

    return NextResponse.json({ message: 'Data migrated successfully' });
  } catch (error) {
    console.error('Error migrating guest data:', error);
    return NextResponse.json({ error: 'Failed to migrate data' }, { status: 500 });
  }
}
