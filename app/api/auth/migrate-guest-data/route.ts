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
    const updatePayload = { user_id: user.id, guest_id: null, owner_type: 'user' };

    // Migrate classes
    // @ts-ignore
    await supabase
      .from('classes')
      .update(updatePayload)
      .eq('guest_id', guestId);

    // Migrate assignments
    // @ts-ignore
    await supabase
      .from('assignments')
      .update(updatePayload)
      .eq('guest_id', guestId);

    // Migrate personal_tasks
    // @ts-ignore
    await supabase
      .from('personal_tasks')
      .update(updatePayload)
      .eq('guest_id', guestId);

    // Migrate materials
    // @ts-ignore
    await supabase
      .from('materials')
      .update(updatePayload)
      .eq('guest_id', guestId);

    return NextResponse.json({ message: 'Data migrated successfully' });
  } catch (error) {
    console.error('Error migrating guest data:', error);
    return NextResponse.json({ error: 'Failed to migrate data' }, { status: 500 });
  }
}
