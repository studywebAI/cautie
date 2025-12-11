import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookies().get(name)?.value,
      },
    }
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  const { searchParams } = new URL(request.url);
  const guestId = searchParams.get('guestId');

  if (!session && !guestId) {
    return NextResponse.json([]);
  }

  // Get classes the user owns
  let ownedClasses: any[] = [];
  if (session) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('owner_id', session.user.id);
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    ownedClasses = data;
  } else if (guestId) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('guest_id', guestId);
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    ownedClasses = data;
  }

  let memberClasses: any[] = [];
  if (session) {
    const { data: memberClassesData, error: memberError } = await supabase
      .from('class_members')
      .select('classes(*)')
      .eq('member_id', session.user.id);
    
    if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });
    
    memberClasses = memberClassesData?.map(member => member.classes) || [];
  }

  const allClasses = [...ownedClasses, ...memberClasses];
  const uniqueClasses = Array.from(new Map(allClasses.map(c => [c.id, c])).values());
  
  return NextResponse.json(uniqueClasses);
}

export async function POST(request: Request) {
  const { name, description, guestId } = await request.json();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !guestId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Generate unique join code
  let joinCode;
  let attempts = 0;
  do {
    joinCode = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').sort(() => Math.random() - 0.5).slice(0,6).join('');
    const { data: existing } = await supabase
      .from('classes')
      .select('id')
      .eq('join_code', joinCode)
      .single();
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) {
    return NextResponse.json({ error: 'Failed to generate unique join code' }, { status: 500 });
  }

  // Cast to correct insert type
  const insertData = {
    name, 
    description,
    join_code: joinCode,
    owner_id: user?.id || null,
    guest_id: guestId || null,
    owner_type: user ? 'user' : 'guest'
  };
  
  const { data, error } = await supabase
    .from('classes')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
