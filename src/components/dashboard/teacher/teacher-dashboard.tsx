'use client';

import { useContext, useState, useEffect } from 'react';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ClassCard } from './class-card';
import { CreateClassDialog } from './create-class-dialog';
import type { ClassInfo } from '@/lib/teacher-types';

function TeacherDashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  );
}

export function TeacherDashboard() {
  const { teacherDashboardData, isLoading } = useContext(AppContext) as AppContextType;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [classes, setClasses] = useState<ClassInfo[]>([]);

  useEffect(() => {
    if (teacherDashboardData?.classes) {
      setClasses(teacherDashboardData.classes);
    }
  }, [teacherDashboardData]);

  const handleClassCreated = (newClass: Omit<ClassInfo, 'id' | 'studentCount' | 'averageProgress' | 'assignmentsDue' | 'alerts'> & {description?: string}) => {
    const newClassData: ClassInfo = {
      id: `class-${Date.now()}-${Math.random()}`, // Temporary unique ID
      name: newClass.name,
      studentCount: 0,
      averageProgress: 0,
      assignmentsDue: 0,
      alerts: ["New class created! Invite students to get started."],
    };
    setClasses(prev => [...prev, newClassData]);
  };


  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Your Classes</h1>
          <p className="text-muted-foreground">
            An overview of all your classes, assignments, and student progress.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Class
        </Button>
      </header>

      {isLoading && classes.length === 0 ? (
        <TeacherDashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classInfo) => (
            <ClassCard key={classInfo.id} classInfo={classInfo} />
          ))}
        </div>
      )}

      <CreateClassDialog
        isOpen={isCreateDialogOpen}
        setIsOpen={setIsCreateDialogOpen}
        onClassCreated={handleClassCreated}
      />
    </div>
  );
}
