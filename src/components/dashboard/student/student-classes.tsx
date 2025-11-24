'use client';

import { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { JoinClassDialog } from './join-class-dialog';
import { PlusCircle } from 'lucide-react';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { ClassCard } from '../teacher/class-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';


export function StudentClasses() {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const { classes, isLoading, refetchClasses, role } = useContext(AppContext) as AppContextType;
  const { toast } = useToast();

  const handleClassJoined = async (classCode: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_code: classCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join class.');
      }

      // Refetch the list of classes to include the newly joined one
      await refetchClasses();
      return true;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Could not join class',
        description: error.message,
      });
      return false;
    }
  };
  
  // Only show classes the user is a member of, not ones they own
  const enrolledClasses = classes.filter(c => c.owner_id !== (AppContext as any).session?.user?.id);

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
      );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Your Classes</h1>
          <p className="text-muted-foreground">
            All the classes you are enrolled in.
          </p>
        </div>
        <Button onClick={() => setIsJoinDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Join a Class
        </Button>
      </header>

      {enrolledClasses.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12 text-center">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              You are not in any classes yet.
            </h3>
            <p className="text-sm text-muted-foreground">
              Join a class using a code from your teacher to get started.
            </p>
            <Button className="mt-4" onClick={() => setIsJoinDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Join a Class
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledClasses.map((classInfo) => (
            <ClassCard key={classInfo.id} classInfo={classInfo} />
          ))}
        </div>
      )}

      <JoinClassDialog
        isOpen={isJoinDialogOpen}
        setIsOpen={setIsJoinDialogOpen}
        onClassJoined={handleClassJoined}
      />
    </div>
  );
}
