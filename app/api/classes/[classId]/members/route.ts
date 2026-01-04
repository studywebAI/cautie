import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET class members
export async function GET(request: Request, { params }: { params: { classId: string } }) {
  const { classId } = params
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  console.log('DEBUG: Members GET - User:', user?.id)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user owns the class
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('owner_id, user_id')
    .eq('id', classId)
    .single()

  console.log('DEBUG: Members GET - Class data:', { classData, classError, classId, userId: user.id })

  if (classError) {
    console.log('DEBUG: Members GET - Class not found')
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  }

  if (!classData) {
    console.log('DEBUG: Members GET - Class not found')
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  }

  let hasAccess = false;
  if (classData.owner_id === user.id || classData.user_id === user.id) {
    hasAccess = true;
  } else {
    // Check if user is a teacher member
    const { data: memberData, error: memberError } = await supabase
      .from('class_members')
      .select('role')
      .eq('class_id', classId)
      .eq('user_id', user.id)
      .single()

    console.log('DEBUG: Members GET - Member check:', { memberData, memberError })

    if (!memberError && memberData && memberData.role === 'teacher') {
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    console.log('DEBUG: Members GET - Access denied')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get class members
  const { data, error } = await supabase
    .from('class_members')
    .select('user_id, role')
    .eq('class_id', classId)

  if (error) {
    console.error('Error fetching class members:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get profiles for these users
  const userIds = data.map(m => m.user_id)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }

  // Transform data to match Student type
  const members = data.map(member => {
    const profile = profiles?.find(p => p.id === member.user_id)
    let name = profile?.full_name

    // If no full_name, derive from email
    if (!name && profile?.email) {
      name = profile.email.split('@')[0] // Take part before @
    }

    // Final fallback
    if (!name) {
      name = `Student ${member.user_id.slice(-4)}`
    }

    return {
      id: member.user_id,
      name: name,
      email: profile?.email || `${member.user_id.slice(-4)}@example.com`,
      avatarUrl: null,
      overallProgress: 0, // Placeholder - would calculate from assignments
      role: member.role
    }
  })

  return NextResponse.json(members)
}
