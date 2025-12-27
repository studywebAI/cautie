import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { blockId: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blockId = params.blockId;

    // For now, use the existing blocks table structure
    // This will be updated when the new schema is applied
    const { data: block, error: blockError } = await supabase
      .from('blocks')
      .select('*')
      .eq('id', blockId)
      .single();

    if (blockError || !block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // TODO: Implement proper access control for new hierarchy
    // For now, allow access if user owns the material
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .select('user_id, class_id')
      .eq('id', block.material_id)
      .single();

    if (materialError || !material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // Check access
    let hasAccess = material.user_id === user.id;
    if (material.class_id) {
      const { data: classData } = await supabase
        .from('classes')
        .select('owner_id')
        .eq('id', material.class_id)
        .single();

      if (classData?.owner_id === user.id) {
        hasAccess = true;
      } else {
        const { count } = await supabase
          .from('class_members')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', material.class_id)
          .eq('user_id', user.id);

        if (count && count > 0) {
          hasAccess = true;
        }
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ block });
  } catch (error) {
    console.error('Block GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { blockId: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blockId = params.blockId;
    const body = await request.json();
    const { content, type, order_index, data } = body;

    // Get block and check access through material
    const { data: block, error: blockError } = await supabase
      .from('blocks')
      .select('material_id')
      .eq('id', blockId)
      .single();

    if (blockError || !block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Check material access
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .select('user_id, class_id')
      .eq('id', block.material_id)
      .single();

    if (materialError || !material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // Only teachers can modify blocks
    let hasAccess = material.user_id === user.id;
    if (material.class_id) {
      const { data: classData } = await supabase
        .from('classes')
        .select('owner_id')
        .eq('id', material.class_id)
        .single();

      if (classData?.owner_id === user.id) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Only teachers can modify blocks' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (order_index !== undefined) updateData.order_index = order_index;
    if (data !== undefined) updateData.data = data;

    // Update the block
    const { data: updatedBlock, error: updateError } = await supabase
      .from('blocks')
      .update(updateData)
      .eq('id', blockId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating block:', updateError);
      return NextResponse.json({ error: 'Failed to update block' }, { status: 500 });
    }

    return NextResponse.json({ block: updatedBlock });
  } catch (error) {
    console.error('Block PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { blockId: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blockId = params.blockId;

    // Get block and check access
    const { data: block, error: blockError } = await supabase
      .from('blocks')
      .select('material_id')
      .eq('id', blockId)
      .single();

    if (blockError || !block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Check material access
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .select('user_id, class_id')
      .eq('id', block.material_id)
      .single();

    if (materialError || !material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // Only teachers can delete blocks
    let hasAccess = material.user_id === user.id;
    if (material.class_id) {
      const { data: classData } = await supabase
        .from('classes')
        .select('owner_id')
        .eq('id', material.class_id)
        .single();

      if (classData?.owner_id === user.id) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Only teachers can delete blocks' }, { status: 403 });
    }

    // Delete the block
    const { error: deleteError } = await supabase
      .from('blocks')
      .delete()
      .eq('id', blockId);

    if (deleteError) {
      console.error('Error deleting block:', deleteError);
      return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Block deleted successfully' });
  } catch (error) {
    console.error('Block DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}