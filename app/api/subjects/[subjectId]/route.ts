import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const resolvedParams = await params;
  const subjectId = resolvedParams.subjectId;

  console.log(`🔍 DETAIL API: GET /api/subjects/${subjectId}`);
  console.log(`🔍 Params resolved:`, resolvedParams);
  console.log(`🔍 SubjectId type:`, typeof subjectId);
  console.log(`🔍 SubjectId length:`, subjectId?.length);

  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // First check if this subject ID exists at all
    const { data: allSubjects, error: listError } = await supabase
      .from('subjects')
      .select('id, title')
      .limit(10);

    console.log(`🔍 All subjects in DB (first 10):`, allSubjects);
    console.log(`🔍 Looking for ID: "${subjectId}"`);

    // Check exact match
    const exactMatch = allSubjects?.find(s => s.id === subjectId);
    console.log(`🔍 Exact match found:`, exactMatch);

    // Check case-insensitive match
    const caseInsensitiveMatch = allSubjects?.find(s => s.id?.toLowerCase() === subjectId?.toLowerCase());
    console.log(`🔍 Case-insensitive match:`, caseInsensitiveMatch);

    // Try the actual query
    const { data: subject, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single();

    if (error) {
      console.log(`❌ Subject fetch error:`, error);
      console.log(`❌ Error code:`, error.code);
      console.log(`❌ Error details:`, error.details);

      // Try alternative queries
      console.log(`🔍 Trying alternative query methods...`);

      // Query without .single()
      const { data: multipleResults, error: multiError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId);

      console.log(`🔍 Multiple results query:`, multipleResults, multiError);

      return NextResponse.json({
        error: 'Subject not found',
        subjectId: subjectId,
        subjectIdType: typeof subjectId,
        dbError: error.message,
        errorCode: error.code,
        allSubjectIds: allSubjects?.map(s => s.id),
        exactMatch: !!exactMatch
      }, { status: 404 });
    }

    console.log(`✅ Subject found:`, subject);
    return NextResponse.json(subject);

  } catch (err) {
    console.error(`💥 Unexpected error:`, err);
    return NextResponse.json({
      error: 'Internal server error',
      subjectId: subjectId,
      errorMessage: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}