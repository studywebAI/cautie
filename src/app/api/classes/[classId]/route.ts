
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

// GET a specific class's public info
export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const classId = params.classId;
  const cookieStore = cookies();
  // No need for admin client here, public info is fine
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });
  
  const { data: classData, error } = await supabase
    .from('classes')
    .select('id, name, description')
    .eq('id', classId)
    .single();

  if (error) {
    console.error(`Error fetching class ${classId}:`, error);
    return NextResponse.json({ error: 'Class not found.' }, { status: 404 });
  }

  return NextResponse.json(classData);
}
