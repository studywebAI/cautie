
'use client';

import { useState, useContext, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { ClassCard } from './class-card';
import { CreateClassDialog } from './create-class-dialog';
import { AppContext, AppContextType, ClassInfo } from '@/contexts/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export function TeacherDashboard() {
  const { classes, createClass, isLoading, refetchClasses } = useContext(AppContext) as AppContextType;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allClasses, setAllClasses] = useState<ClassInfo[]>([]);
  const [archivedClassesCount, setArchivedClassesCount] = useState(0);
  const { toast } = useToast();

  // Fetch all classes including archived when toggling
  const fetchAllClasses = async (includeArchived = false) => {
    try {
      const params = includeArchived ? '?includeArchived=true' : '';
      const response = await fetch(`/api/classes${params}`);
      if (response.ok) {
        const data = await response.json();
        setAllClasses(data);
        // Count archived classes
        const archived = data.filter((cls: ClassInfo) => cls.status === 'archived');
        setArchivedClassesCount(archived.length);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  // Update allClasses when classes context changes
  useEffect(() => {
    setAllClasses(classes || []);
    // Fetch archived count separately
    fetchAllClasses(true).then(() => {
      // This will update archivedClassesCount
    });
  }, [classes]);

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

  // Handle toggling archived classes view
  const handleToggleArchived = async () => {
    if (!showArchived) {
      // Fetch classes including archived ones
      await fetchAllClasses(true);
    } else {
      // Revert to normal classes
      await refetchClasses();
    }
    setShowArchived(!showArchived);
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

  const filteredClasses = allClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cls.description && cls.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeClasses = filteredClasses.filter(cls => cls.status !== 'archived');
  const archivedClasses = filteredClasses.filter(cls => cls.status === 'archived');

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

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search classes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-full"
        />
      </div>

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
          {/* Active Classes - Always Visible */}
          <div className="min-h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeClasses.map((classInfo) => (
                <ClassCard
                  key={classInfo.id}
                  classInfo={classInfo}
                  isArchived={false}
                />
              ))}
            </div>
          </div>

          {/* Archived Classes Toggle */}
          {archivedClassesCount > 0 && (
            <div className="text-center pt-8 pb-4">
              <Button
                variant="outline"
                onClick={handleToggleArchived}
                className="rounded-full"
              >
                {showArchived ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Hide Archived Classes ({archivedClassesCount})
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show Archived Classes ({archivedClassesCount})
                  </>
                )}
              </Button>

              {showArchived && (
                <div className="mt-8 space-y-4">
                  <h2 className="text-xl font-semibold text-muted-foreground">Archived Classes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedClasses.map((classInfo) => (
                      <ClassCard
                        key={classInfo.id}
                        classInfo={classInfo}
                      />
                    ))}
                  </div>
                </div>
              )}
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
