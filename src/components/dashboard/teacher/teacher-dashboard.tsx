'use client';

import { useContext, useState } from 'react';
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
  const [classes, setClasses] = useState(teacherDashboardData?.classes || []);

  const handleClassCreated = (newClass: Omit<ClassInfo, 'id'>) => {
    const newClassWithId: ClassInfo = {
      ...newClass,
      id: `class-${Date.now()}` // Temporary ID generation
    };
    setClasses(prev => [...prev, newClassWithId]);
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

      {isLoading || !teacherDashboardData ? (
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
