'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ClassCard } from './class-card';
import { CreateClassDialog } from './create-class-dialog';
import type { ClassInfo } from '@/lib/teacher-types';

export function TeacherDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [classes, setClasses] = useState<ClassInfo[]>([]);

  const handleClassCreated = (newClass: { name: string; description: string }) => {
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

      {classes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12 text-center">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              You haven't created any classes yet.
            </h3>
            <p className="text-sm text-muted-foreground">
              Create a class to start adding assignments and students.
            </p>
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Class
            </Button>
          </div>
        </div>
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
