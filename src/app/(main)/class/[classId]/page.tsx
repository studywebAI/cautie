
'use client';

import { useParams } from 'next/navigation';
import { useContext } from 'react';
import { AppContext, AppContextType, ClassInfo } from '@/contexts/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignmentList } from '@/components/dashboard/teacher/assignment-list';
import { StudentList } from '@/components/dashboard/teacher/student-list';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Student } from '@/lib/teacher-types';

const placeholderStudentsData: Student[] = [
  { id: 'student-1', name: 'Alice Johnson', avatarUrl: PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl, overallProgress: 88 },
  { id: 'student-2', name: 'Bob Williams', avatarUrl: PlaceHolderImages.find(p => p.id === 'user-avatar-2')?.imageUrl, overallProgress: 72 },
  { id: 'student-3', name: 'Charlie Brown', overallProgress: 95 },
  { id: 'student-4', name: 'Diana Miller', avatarUrl: PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl, overallProgress: 65 },
];


export default function ClassDetailsPage() {
  const params = useParams();
  const { classId } = params as { classId: string };
  const { classes, assignments, isLoading } = useContext(AppContext) as AppContextType;
  
  const classInfo: ClassInfo | undefined = classes.find(c => c.id === classId);
  const classAssignments = assignments.filter(a => a.class_id === classId);

  if (isLoading && !classInfo) {
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
        <p className="text-muted-foreground">{classInfo.description || 'Manage assignments, students, and settings for this class.'}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <AssignmentList assignments={classAssignments} classId={classId} />
        </div>
        <div className="lg:col-span-1">
          <StudentList students={placeholderStudentsData} />
        </div>
      </div>
    </div>
  );
}
