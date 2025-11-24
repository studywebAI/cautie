
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
  
  // Get classes the user owns
   const { data: ownedClasses, error: ownedError } = await supabase
    .from('classes')
    .select()
    .eq('owner_id', session.user.id);
  
  if (ownedError) {
    return NextResponse.json({ error: ownedError.message }, { status: 500 });
  }

  // Get IDs of classes the user is a member of
  const { data: memberClassRelations, error: memberError } = await supabase
    .from('class_members')
    .select('class_id')
    .eq('user_id', session.user.id);

  if (memberError) {
     return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  const memberClassIds = memberClassRelations.map(r => r.class_id);

  // Get full data for classes the user is a member of
  let memberClasses: any[] = [];
  if (memberClassIds.length > 0) {
    const { data, error } = await supabase
        .from('classes')
        .select()
        .in('id', memberClassIds);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    memberClasses = data;
  }
  
  const allClasses = [...ownedClasses, ...memberClasses];
  // Remove duplicates in case a teacher is also a member of their own class
  const uniqueClasses = Array.from(new Set(allClasses.map(c => c.id)))
    .map(id => allClasses.find(c => c.id === id));


  return NextResponse.json(uniqueClasses);
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
