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

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const userRole = profile?.role || 'student';
    const isTeacher = userRole === 'teacher';

    let subjects: any[] = [];

    if (isTeacher) {
      // Teachers see subjects from classes they own
      const { data: ownedSubjects, error: ownedError } = await supabase
        .from('subjects')
        .select('*, classes!inner(*)')
        .eq('classes.owner_id', user.id);

      if (ownedError) {
        console.log(`Owned subjects fetch error:`, ownedError);
      } else {
        subjects = ownedSubjects || [];
      }
    } else {
      // Students see subjects from classes they're members of
      const { data: memberSubjects, error: memberError } = await supabase
        .from('class_members')
        .select('classes!inner(subjects(*))')
        .eq('user_id', user.id);

      if (memberError) {
        console.log(`Member subjects fetch error:`, memberError);
      } else {
        // Flatten the nested structure
        subjects = memberSubjects?.flatMap(member =>
          member.classes?.subjects || []
        ) || [];
      }
    }

    console.log(`Subjects found for ${userRole}:`, subjects.length);
    return NextResponse.json(subjects);

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