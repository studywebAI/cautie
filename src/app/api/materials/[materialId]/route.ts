
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

// GET a specific material with its content
export async function GET(
  request: Request,
  { params }: { params: { materialId: string } }
) {
  const materialId = params.materialId;
  const cookieStore = cookies();
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: material, error } = await supabase
    .from('materials')
    .select('*')
    .eq('id', materialId)
    .single();

  if (error || !material) {
    return NextResponse.json({ error: 'Material not found' }, { status: 404 });
  }

  // Security Check: User must be member or owner of the class
  // ... this should be implemented with RLS ...

  let content = null;

  if (material.type === 'NOTE') {
    const { data: noteContent, error: contentError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', material.content_id)
      .single();
    if (contentError) {
      return NextResponse.json({ error: 'Failed to fetch note content' }, { status: 500 });
    }
    content = noteContent;
  }
  // TODO: Add logic for 'QUIZ' and 'FLASHCARDS' types

  return NextResponse.json({ ...material, content });
}

// DELETE a material
export async function DELETE(
  request: Request,
  { params }: { params: { materialId: string } }
) {
  const materialId = params.materialId;
  const cookieStore = cookies();
  const supabase = createServerClient<Database>({ cookies: () => cookieStore });

   const { data: { user } } = await supabase.auth.getUser();
   if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const { data: material, error: fetchError } = await supabase
    .from('materials')
    .select('class_id, content_id, type')
    .eq('id', materialId)
    .single();

   if (fetchError || !material) {
     return NextResponse.json({ error: 'Material not found' }, { status: 404 });
   }

    // Security check: User must be owner
    const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('owner_id')
        .eq('id', material.class_id)
        .single();
    
    if (classError || !classData || classData.owner_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

   // Delete the material entry
   const { error: deleteMaterialError } = await supabase
    .from('materials')
    .delete()
    .eq('id', materialId);
    
   if (deleteMaterialError) {
    return NextResponse.json({ error: deleteMaterialError.message }, { status: 500 });
   }

   // Also delete the associated content (e.g., the note)
   if (material.type === 'NOTE' && material.content_id) {
    await supabase.from('notes').delete().eq('id', material.content_id);
   }

   return NextResponse.json({ message: 'Material deleted successfully' });
}
