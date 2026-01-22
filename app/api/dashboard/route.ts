import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all dashboard data in parallel
    const [
      classesRes,
      assignmentsRes,
      personalTasksRes,
      profileRes
    ] = await Promise.all([
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/classes`, {
        headers: { cookie: cookieStore.toString() }
      }),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/assignments`, {
        headers: { cookie: cookieStore.toString() }
      }),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/personal-tasks`, {
        headers: { cookie: cookieStore.toString() }
      }),
      supabase.from('profiles').select('role').eq('id', user.id).single()
    ])

    const [classes, assignments, personalTasks] = await Promise.all([
      classesRes.json(),
      assignmentsRes.json(),
      personalTasksRes.json()
    ])

    const role = profileRes.data?.role || 'student'

    // Get students for teachers
    let students = []
    if (role === 'teacher' && classes.length > 0) {
      const ownedClassIds = classes.filter((c: any) => c.owner_id === user.id).map((c: any) => c.id)
      if (ownedClassIds.length > 0 && ownedClassIds.length <= 10) {
        const studentPromises = ownedClassIds.map((id: string) =>
          fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/classes/${id}/members`, {
            headers: { cookie: cookieStore.toString() }
          }).then(res => res.json())
        )
        const studentsPerClass = await Promise.all(studentPromises)
        const allStudents = studentsPerClass.flat()
        students = Array.from(new Set(allStudents.map((s: any) => s.id)))
          .map(id => allStudents.find((s: any) => s.id === id))
      }
    }

    return NextResponse.json({
      classes: classes || [],
      assignments: assignments || [],
      personalTasks: personalTasks || [],
      students: students || [],
      role
    })

  } catch (err) {
    console.error('Dashboard API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}