
'use client';

import { useContext, useEffect, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { TeacherDashboard } from '@/components/dashboard/teacher/teacher-dashboard';
import { StudentClasses } from '@/components/dashboard/student/student-classes';
import { useToast } from '@/hooks/use-toast';
import { CreateClassDialog } from '@/components/dashboard/teacher/create-class-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircledIcon } from '@radix-ui/react-icons';

function ClassesPageContent() {
  const { role, session, refetchClasses, classes, isLoading } = useContext(AppContext) as AppContextType;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);

  useEffect(() => {
    const joinCode = searchParams.get('join_code');
    if (joinCode) {
      const joinClass = async () => {
        if (!session) {
          toast({
            variant: 'destructive',
            title: 'You must be logged in',
            description: 'Please log in to join a class.',
          });
          router.push(`/login?redirect=/classes?join_code=${joinCode}`);
          return;
        }

        try {
          const response = await fetch("/api/classes/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ class_code: joinCode }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to join class.");
          }
          
          toast({ title: "Successfully joined class!" });
          await refetchClasses();

        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Could not join class",
            description: error.message,
          });
        } finally {
            const newPath = window.location.pathname;
            window.history.replaceState({}, "", newPath);
        }
      };
      
      joinClass();
    }
  }, [searchParams, router, toast, session, refetchClasses]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full text-lg">Loading classes...</div>;
  }

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h2 className="text-2xl font-bold">No classes found!</h2>
        <p className="text-gray-500">It looks like you haven't joined or created any classes yet.</p>
        <Button onClick={() => setIsCreateClassOpen(true)}>
          <PlusCircledIcon className="mr-2 h-4 w-4" /> Create your first class
        </Button>
        <CreateClassDialog isOpen={isCreateClassOpen} setIsOpen={setIsCreateClassOpen} onClassCreated={refetchClasses} />
      </div>
    );
  }

  return role === 'student' ? <StudentClasses /> : <TeacherDashboard />;
}


export default function ClassesPage() {
    return (
        <Suspense fallback={<div>Loading classes...</div>}>
            <ClassesPageContent />
        </Suspense>
    );
}
