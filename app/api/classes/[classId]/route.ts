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
  const cookieStore = await cookies()
  // No need for admin client here, public info is fine
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        }
      }
    }
  );

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
