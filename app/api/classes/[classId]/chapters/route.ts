import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = await params;

    // Check if user has access to the class (owner or member)
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, owner_id')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    let hasAccess = classData.owner_id === user.id;
    if (!hasAccess) {
      const { count } = await supabase
        .from('class_members')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classId)
        .eq('user_id', user.id);

      hasAccess = (count || 0) > 0;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get chapters for the class
    const { data: chapters, error: chaptersError } = await supabase
      .from('class_chapters')
      .select('*')
      .eq('class_id', classId)
      .order('order_index', { ascending: true });

    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
    }

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('Chapters GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = await params;
    const body = await request.json();
    const { title, description, order_index } = body;

    // Validate input
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Check if user is teacher in the class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, owner_id')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    let isTeacher = classData.owner_id === user.id;
    if (!isTeacher) {
      const { data: memberData } = await supabase
        .from('class_members')
        .select('role')
        .eq('class_id', classId)
        .eq('user_id', user.id)
        .single();

      isTeacher = memberData?.role === 'teacher';
    }

    if (!isTeacher) {
      return NextResponse.json({ error: 'Only teachers can create chapters' }, { status: 403 });
    }

    // Create the chapter
    const { data, error } = await supabase
      .from('class_chapters')
      .insert({
        class_id: classId,
        title: title.trim(),
        description: description?.trim() || null,
        order_index: order_index || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chapter:', error);
      return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
    }

    return NextResponse.json({ chapter: data });
  } catch (error) {
    console.error('Chapters POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}