'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { JoinClassDialog } from './join-class-dialog';
import { PlusCircle } from 'lucide-react';

export function StudentClasses() {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [enrolledClasses, setEnrolledClasses] = useState([]); // Will be populated later

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
          {/* Enrolled class cards will be rendered here */}
        </div>
      )}

      <JoinClassDialog
        isOpen={isJoinDialogOpen}
        setIsOpen={setIsJoinDialogOpen}
        onClassJoined={() => {
          // Logic to handle class joining
        }}
      />
    </div>
  );
}
