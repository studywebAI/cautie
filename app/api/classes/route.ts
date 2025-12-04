import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          cookieStore.set({ name, value: '', ...options });
        },
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
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !guestId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Cast to correct insert type
  const insertData: Database['public']['Tables']['classes']['Insert'] = {
    name, 
    description,
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
