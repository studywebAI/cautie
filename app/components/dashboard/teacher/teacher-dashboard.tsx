
'use client';

import { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ClassCard } from './class-card';
import { CreateClassDialog } from './create-class-dialog';
import { AppContext, AppContextType, ClassInfo } from '@/contexts/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export function TeacherDashboard() {
  const { classes, createClass, isLoading, refetchClasses } = useContext(AppContext) as AppContextType;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [archivedClassIds, setArchivedClassIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('archived-classes');
    return stored ? JSON.parse(stored) : [];
  });
  const { toast } = useToast();

  const toggleArchive = (classId: string) => {
    const newArchived = archivedClassIds.includes(classId)
      ? archivedClassIds.filter(id => id !== classId)
      : [...archivedClassIds, classId];
    setArchivedClassIds(newArchived);
    localStorage.setItem('archived-classes', JSON.stringify(newArchived));
  };

  const handleClassCreated = async (newClass: { name: string; description: string | null }): Promise<ClassInfo | null> => {
     try {
      const createdClass = await createClass(newClass);
      toast({
        title: 'Class Created',
        description: `"${newClass.name}" has been successfully created.`,
      });
      await refetchClasses();
      return createdClass;
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the class. Please try again.',
      });
      return null;
    }
  };
  
  if (isLoading || !classes) {
      return (
        <div className="flex flex-col gap-8">
            <header className="flex justify-between items-center">
                 <div>
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96 mt-2" />
                </div>
                <Skeleton className="h-10 w-36" />
            </header>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
            </div>
        </div>
      )
  }

  const activeClasses = classes.filter(cls => !archivedClassIds.includes(cls.id));
  const archivedClasses = classes.filter(cls => archivedClassIds.includes(cls.id));

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

      {activeClasses.length === 0 && archivedClasses.length === 0 ? (
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
        <div className="space-y-8">
          {activeClasses.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Classes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeClasses.map((classInfo) => (
                  <ClassCard
                    key={classInfo.id}
                    classInfo={classInfo}
                    onArchive={() => toggleArchive(classInfo.id)}
                    isArchived={false}
                  />
                ))}
              </div>
            </div>
          )}

          {archivedClasses.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Archived Classes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archivedClasses.map((classInfo) => (
                  <ClassCard
                    key={classInfo.id}
                    classInfo={classInfo}
                    onArchive={() => toggleArchive(classInfo.id)}
                    isArchived={true}
                  />
                ))}
              </div>
            </div>
          )}
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
