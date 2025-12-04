import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database, Json } from '@/lib/supabase/database.types'
import { CookieOptions } from '@supabase/ssr' // Correct import for CookieOptions
import { generateKnowledgeGraph } from '@/ai/flows/generate-knowledge-graph'

export const dynamic = 'force-dynamic'

// GET materials for a class
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('classId')

  if (!classId) {
    return NextResponse.json({ error: 'classId is required' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get: (name: string) => (cookieStore as any).get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => (cookieStore as any).set(name, value, options),
        remove: (name: string, options: CookieOptions) => (cookieStore as any).set(name, '', options),
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Security check: user must be owner or member of the class
  // This logic should be more robust in a real app (e.g., using RLS)
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('owner_id')
    .eq('id', classId)
    .single();
  
  if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  // Type narrowing to ensure classData has owner_id when not null or error
  const ownerId = classData.owner_id; 

  const { data: memberData, error: memberError } = await supabase
    .from('class_members')
    .select()
    .eq('class_id', classId)
    .eq('user_id', session.user.id);
    
  if (ownerId !== session.user.id && (!memberData || memberData.length === 0)) {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}


// POST a new material
export async function POST(request: Request) {
  const { title, class_id, type, notes_content, content, source_text_for_concepts } = await request.json();
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get: (name: string) => (cookieStore as any).get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => (cookieStore as any).set(name, value, options),
        remove: (name: string, options: CookieOptions) => (cookieStore as any).set(name, '', options),
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Security check
  const { data: classData, error: classCheckError } = await supabase
    .from('classes')
    .select('owner_id')
    .eq('id', class_id)
    .single();

  // Type narrowing for owner_id before access
  const classOwnerId = classData?.owner_id; 

  if (classCheckError || !classData || classOwnerId !== user.id) {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let noteId = null;

  // Handle NOTE type specifically
  if (type === 'NOTE' && notes_content) {
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({ title, content: notes_content, owner_type: 'user', user_id: user.id } as any) // Temporary cast
      .select()
      .single();

    if (noteError || !note) {
      return NextResponse.json({ error: noteError?.message || 'Failed to create note content' }, { status: 500 });
    }
    noteId = note.id;
  }
  
  // Generate concepts from the provided source text
  let concepts: Json[] = []; // Explicitly typed as Json[]
  if (source_text_for_concepts) {
    try {
      const graph = await generateKnowledgeGraph({ sourceText: source_text_for_concepts });
      concepts = graph.concepts;
    } catch (aiError) {
      console.error('AI concept generation failed:', JSON.stringify(aiError, null, 2));
      return NextResponse.json({ error: 'AI concept generation failed: ' + JSON.stringify(aiError) }, { status: 500 });
    }
  }

  // Create the material entry
  const { data: material, error: materialError } = await supabase
    .from('materials')
    .insert({
      class_id,
      title,
      type,
      content_id: noteId,
      content: content || null, // Store quiz/flashcard JSON
      concepts,
      owner_type: 'user', // Added owner_type
      user_id: user.id, // Added user_id
    } as any) // Temporary cast
    .select()
    .single();

  if (materialError) {
    // Attempt to clean up the orphaned note if material creation fails
    if (noteId) {
      await supabase.from('notes').delete().eq('id', noteId);
    }
    return NextResponse.json({ error: materialError.message }, { status: 500 });
  }

  return NextResponse.json(material);
}
