'use client';

import { MySubjectsGrid } from "@/components/dashboard/my-subjects-grid";
import { useContext, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppContext, AppContextType } from "@/contexts/app-context";
import type { Subject } from "@/lib/types";

function SubjectsPageContent() {
  const { classes, isLoading, session } = useContext(AppContext) as AppContextType;

  const subjects: Subject[] = useMemo(() => {
    if (!classes || !session) return [];
    // Subjects are the classes a student is enrolled in.
    const enrolledClasses = classes.filter(c => c.owner_id !== session.user.id);
    return enrolledClasses.map(c => ({
      id: c.id,
      name: c.name,
      progress: 0, // Placeholder until progress is tracked
    }));
  }, [classes, session]);

  if (isLoading) {
    return (
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56" />)}
      </div>
    );
  }

  return <MySubjectsGrid subjects={subjects} />;
}

export default function SubjectsPage() {

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Your Subjects</h1>
        <p className="text-muted-foreground">
          Select a subject to view its dashboard, materials, and progress.
        </p>
      </header>
      <SubjectsPageContent />
    </div>
  );
}
