'use client';

import { MySubjects } from "@/components/dashboard/my-subjects";
import { generateDashboardData, GenerateDashboardDataOutput } from "@/ai/flows/generate-dashboard-data";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function SubjectsPageContent({ dashboardData }: { dashboardData: GenerateDashboardDataOutput | null }) {
  if (!dashboardData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    );
  }

  return <MySubjects subjects={dashboardData.subjects} />;
}

export default function SubjectsPage() {
  const [dashboardData, setDashboardData] = useState<GenerateDashboardDataOutput | null>(null);

  useEffect(() => {
    async function loadData() {
      // We only need the subjects, so we can use a smaller list for faster generation.
      const data = await generateDashboardData({
        studentName: "Alex Jansen",
        subjects: ["History", "Mathematics", "Chemistry", "English Literature"],
      });
      setDashboardData(data);
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Your Subjects</h1>
        <p className="text-muted-foreground">
          Select a subject to view its dashboard, materials, and progress.
        </p>
      </header>
      <SubjectsPageContent dashboardData={dashboardData} />
    </div>
  );
}
