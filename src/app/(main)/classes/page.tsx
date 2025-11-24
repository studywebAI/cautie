
'use client';

import { useContext } from 'react';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { TeacherDashboard } from '@/components/dashboard/teacher/teacher-dashboard';
import { StudentClasses } from '@/components/dashboard/student/student-classes';

export default function ClassesPage() {
  const { role } = useContext(AppContext) as AppContextType;

  return role === 'student' ? <StudentClasses /> : <TeacherDashboard />;
}
