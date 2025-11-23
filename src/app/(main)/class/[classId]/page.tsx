'use client';

import { useParams } from 'next/navigation';
import { useContext } from 'react';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignmentList } from '@/components/dashboard/teacher/assignment-list';
import { StudentList } from '@/components/dashboard/teacher/student-list';

// This is temporary placeholder data. It will be replaced with real data fetching later.
const placeholderAssignments = [
  { id: 'assign-1', title: 'Renaissance Art Quiz', dueDate: '2024-08-15', submissions: 18, totalStudents: 25 },
  { id: 'assign-2', title: 'World War I Essay', dueDate: '2024-08-22', submissions: 12, totalStudents: 25 },
  { id: 'assign-3', title: 'Geography Map Test', dueDate: '2024-09-01', submissions: 0, totalStudents: 25 },
];

const placeholderStudents = [
  { id: 'student-1', name: 'Alice Johnson', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', overallProgress: 88 },
  { id: 'student-2', name: 'Bob Williams', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', overallProgress: 72 },
  { id: 'student-3', name: 'Charlie Brown', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d', overallProgress: 95 },
  { id: 'student-4', name: 'Diana Miller', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d', overallProgress: 65 },
];


export default function ClassDetailsPage() {
  const params = useParams();
  const { classId } = params;
  const { teacherDashboardData, isLoading } = useContext(AppContext) as AppContextType;

  const classInfo = teacherDashboardData?.classes.find(c => c.id === classId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <header>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div>
        <h1 className="text-3xl font-bold font-headline">Class not found</h1>
        <p className="text-muted-foreground">The class you are looking for does not exist or you do not have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">{classInfo.name}</h1>
        <p className="text-muted-foreground">Manage assignments, students, and settings for this class.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <AssignmentList assignments={placeholderAssignments} />
        </div>
        <div className="lg:col-span-1">
          <StudentList students={placeholderStudents} />
        </div>
      </div>
    </div>
  );
}
