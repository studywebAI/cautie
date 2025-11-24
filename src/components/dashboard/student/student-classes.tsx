
'use client';

import { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { JoinClassDialog } from './join-class-dialog';
import { PlusCircle } from 'lucide-react';
import type { ClassInfo } from '@/contexts/app-context';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { ClassCard } from '../teacher/class-card';


// Mock data for classes a student can join. In a real app, this would come from a database.
const joinableClasses: Record<string, Omit<ClassInfo, 'id' | 'owner_id' | 'created_at' | 'description' >> = {
  'HIST-101': {
    name: 'History 101: The Ancient World',
  },
  'SCI-202': {
    name: 'Biology: The Human Body',
  },
  'ART-300': {
    name: 'Introduction to Modern Art',
  },
};


export function StudentClasses() {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [enrolledClasses, setEnrolledClasses] = useState<ClassInfo[]>([]);

  const handleClassJoined = (classCode: string) => {
    // In a real app, you'd verify the classCode against a backend.
    // Here, we'll use our mock data.
    const classToJoinData = joinableClasses[classCode.toUpperCase()];

    if (classToJoinData && !enrolledClasses.some(c => c.name === classToJoinData.name)) {
       const newClass: ClassInfo = {
            id: classCode.toUpperCase(),
            name: classToJoinData.name,
            description: 'A mock class description',
            owner_id: 'mock-owner',
            created_at: new Date().toISOString(),
       }
      setEnrolledClasses(prev => [...prev, newClass]);
    } else {
      // You might want to show a toast message if the code is invalid or already joined
    }
  };

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
