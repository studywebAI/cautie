import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  console.log(`GET /api/subjects/${params.subjectId} - Called with params:`, params);

  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Simple fetch without auth check for debugging
    const { data: subject, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', params.subjectId)
      .single();

    if (error) {
      console.log(`Subject fetch error:`, error);
      console.log(`Searching for subject ID:`, params.subjectId);
      return NextResponse.json({
        error: 'Subject not found',
        subjectId: params.subjectId,
        dbError: error.message
      }, { status: 404 });
    }

    console.log(`Subject found:`, subject);
    return NextResponse.json(subject);

  } catch (err) {
    console.error(`Unexpected error:`, err);
    return NextResponse.json({
      error: 'Internal server error',
      subjectId: params.subjectId
    }, { status: 500 });
  }
}