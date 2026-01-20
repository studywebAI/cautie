import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

// GET all assignments - return empty for hierarchical system compatibility
export async function GET(request: Request) {
  // For the hierarchical subjects system, assignments are accessed via subjects/chapters/paragraphs
  // Return empty array to prevent 500 errors while transitioning
  return NextResponse.json([]);
}

// POST disabled - use hierarchical system via subjects/chapters/paragraphs
export async function POST(request: Request) {
  return NextResponse.json({ error: 'Assignments API disabled - use hierarchical subjects system' }, { status: 410 });
}

