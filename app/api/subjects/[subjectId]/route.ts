import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  console.log(`[${requestId}] GET /api/subjects/${params.subjectId} - Started at ${new Date().toISOString()}`);

  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error(`[${requestId}] GET /api/subjects/${params.subjectId} - Auth error:`, authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the subject
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', params.subjectId)
      .single();

    if (subjectError) {
      console.error(`[${requestId}] GET /api/subjects/${params.subjectId} - Subject fetch error:`, subjectError);
      return NextResponse.json({
        error: 'Subject not found',
        details: subjectError.message
      }, { status: 404 });
    }

    // Check if user owns this subject (is teacher and owns the class)
    if (!subject.class_id) {
      console.error(`[${requestId}] GET /api/subjects/${params.subjectId} - Subject has no class_id`);
      return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
    }

    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('owner_id')
      .eq('id', subject.class_id)
      .single();

    if (classError || classData.owner_id !== user.id) {
      console.error(`[${requestId}] GET /api/subjects/${params.subjectId} - Access denied:`, {
        classError: classError?.message,
        subjectOwner: subject.class_id,
        userId: user.id
      });
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] GET /api/subjects/${params.subjectId} - Success:`, {
      subjectId: subject.id,
      subjectTitle: subject.title,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(subject);

  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] GET /api/subjects/${params.subjectId} - Unexpected error:`, {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : 'No stack trace',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({
      error: 'Internal server error',
      requestId,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}