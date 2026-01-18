import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  console.log(`GET /api/subjects - Called`);

  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Simple fetch for teacher's subjects only (for debugging)
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.log(`Subjects fetch error:`, error);
      return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
    }

    console.log(`Subjects found:`, data?.length || 0);
    return NextResponse.json(data || []);

  } catch (err) {
    console.error(`Unexpected error:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  console.log(`[${requestId}] POST /api/subjects - Started at ${new Date().toISOString()}`);

  try {
    const { name, title, class_id, cover_type, class_label } = await request.json();

    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(`[${requestId}] POST /api/subjects - Auth error:`, authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Check if user is teacher
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'teacher') {
      console.log(`[${requestId}] POST /api/subjects - Access denied: user is ${profile?.role}`);
      return NextResponse.json({ error: 'Only teachers can create subjects' }, { status: 403 });
    }

    // Prepare subject data
    const subjectData = {
      title: title || name,
      class_id: class_id,
      class_label: class_label || title || name,
      cover_type: cover_type || 'ai_icons',
      user_id: user.id
    };

    console.log(`[${requestId}] POST /api/subjects - Creating subject:`, subjectData);

    const { data, error } = await supabase
      .from('subjects')
      .insert([subjectData])
      .select()
      .single();

    if (error) {
      console.error(`[${requestId}] POST /api/subjects - Subject creation failed:`, error);
      return NextResponse.json({
        error: error.message,
        details: 'Failed to create subject'
      }, { status: 500 });
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] POST /api/subjects - Subject created successfully:`, {
      subjectId: data.id,
      subjectTitle: data.title,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(data);

  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] POST /api/subjects - Unexpected error:`, {
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