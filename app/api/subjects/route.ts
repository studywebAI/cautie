import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  console.log(`[${requestId}] GET /api/subjects - Started at ${new Date().toISOString()}`);

  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error(`[${requestId}] GET /api/subjects - Auth error:`, authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

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
      console.log(`[${requestId}] GET /api/subjects - Teacher mode: fetching owned subjects`);

      // First get the class IDs owned by this teacher
      const { data: ownedClasses, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('owner_id', user.id);

      if (classesError) {
        console.error(`[${requestId}] GET /api/subjects - Classes query failed:`, classesError);
        return NextResponse.json({
          error: classesError.message,
          details: 'Failed to fetch owned classes'
        }, { status: 500 });
      }

      const classIds = ownedClasses?.map(c => c.id) || [];

      if (classIds.length === 0) {
        subjects = [];
      } else {
        // Then get subjects for those classes
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .in('class_id', classIds);

        if (error) {
          console.error(`[${requestId}] GET /api/subjects - Subjects query failed:`, error);
          return NextResponse.json({
            error: error.message,
            details: 'Failed to fetch subjects for teacher'
          }, { status: 500 });
        }

        subjects = data || [];
      }

      console.log(`[${requestId}] GET /api/subjects - Teacher fetched ${subjects.length} subjects`);
    } else {
      // Students see subjects from classes they're members of
      console.log(`[${requestId}] GET /api/subjects - Student mode: fetching member subjects`);

      // First get the class IDs the student is a member of
      const { data: memberClasses, error: memberError } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error(`[${requestId}] GET /api/subjects - Member classes query failed:`, memberError);
        return NextResponse.json({
          error: memberError.message,
          details: 'Failed to fetch member classes'
        }, { status: 500 });
      }

      const classIds = memberClasses?.map(m => m.class_id) || [];

      if (classIds.length === 0) {
        subjects = [];
      } else {
        // Then get subjects for those classes
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .in('class_id', classIds);

        if (error) {
          console.error(`[${requestId}] GET /api/subjects - Subjects query failed:`, error);
          return NextResponse.json({
            error: error.message,
            details: 'Failed to fetch subjects for student'
          }, { status: 500 });
        }

        subjects = data || [];
      }

      console.log(`[${requestId}] GET /api/subjects - Student fetched ${subjects.length} subjects`);
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] GET /api/subjects - Completed successfully:`, {
      subjectsReturned: subjects.length,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(subjects);

  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] GET /api/subjects - Unexpected error:`, {
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