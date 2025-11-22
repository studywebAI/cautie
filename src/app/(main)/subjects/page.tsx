'use client';

import { MySubjectsGrid } from "@/components/dashboard/my-subjects-grid";
import { useContext } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppContext, AppContextType } from "@/contexts/app-context";

function SubjectsPageContent() {
  const { dashboardData, isLoading } = useContext(AppContext) as AppContextType;

  if (isLoading || !dashboardData) {
    return (
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56" />)}
      </div>
    );
  }

  return <MySubjectsGrid subjects={dashboardData.subjects} />;
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
