
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'
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
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });

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

  const { data: memberData, error: memberError } = await supabase
    .from('class_members')
    .select()
    .eq('class_id', classId)
    .eq('user_id', session.user.id);
    
  if (classData.owner_id !== session.user.id && (!memberData || memberData.length === 0)) {
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


// POST a new material (specifically a NOTE for now)
export async function POST(request: Request) {
  const { title, notes_content, class_id } = await request.json();
  const cookieStore = cookies();
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });
  
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

  if (classCheckError || !classData || classData.owner_id !== user.id) {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 1. Create the note content first
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .insert({ title, content: notes_content })
    .select()
    .single();

  if (noteError || !note) {
    return NextResponse.json({ error: noteError?.message || 'Failed to create note content' }, { status: 500 });
  }

  // 2. Generate concepts from the note content
  const sourceTextForConcepts = notes_content.map((n: any) => `# ${n.title}\n${n.content}`).join('\n\n');
  let concepts = [];
  try {
    const graph = await generateKnowledgeGraph({ sourceText: sourceTextForConcepts });
    concepts = graph.concepts;
  } catch (aiError) {
    console.warn("AI concept generation failed:", aiError);
    // Continue without concepts if AI fails
  }

  // 3. Create the material entry linking to the note
  const { data: material, error: materialError } = await supabase
    .from('materials')
    .insert({
      class_id,
      title,
      type: 'NOTE',
      content_id: note.id,
      concepts: concepts,
    })
    .select()
    .single();

  if (materialError) {
    // Attempt to clean up the orphaned note if material creation fails
    await supabase.from('notes').delete().eq('id', note.id);
    return NextResponse.json({ error: materialError.message }, { status: 500 });
  }

  return NextResponse.json(material);
}
