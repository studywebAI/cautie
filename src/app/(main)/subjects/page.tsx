'use client';

import { MySubjects } from "@/components/dashboard/my-subjects";
import { useContext, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppContext, AppContextType } from "@/contexts/app-context";
import { Subject } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";

// Helper function to get image details for a subject
function getSubjectImage(subjectName: string): { imageUrl: string, imageHint: string } {
    const defaultImage = PlaceHolderImages.find(img => img.id === "subject-icon-history")!;
    const subjectId = `subject-icon-${subjectName.toLowerCase().split(' ').join('-')}`;
    const image = PlaceHolderImages.find(img => img.id === subjectId);
    
    return image || {
        imageUrl: `https://picsum.photos/seed/${subjectName}/600/400`,
        imageHint: subjectName.toLowerCase()
    };
}


function SubjectsPageContent() {
  const { dashboardData, isLoading } = useContext(AppContext) as AppContextType;
  const [subjectsWithImages, setSubjectsWithImages] = useState<Subject[]>([]);

  useEffect(() => {
    if (dashboardData?.subjects) {
      const subjects = dashboardData.subjects.map((subjectName) => {
        const { imageUrl, imageHint } = getSubjectImage(subjectName);
        return {
          id: subjectName.toLowerCase().replace(' ', '-'),
          name: subjectName,
          progress: Math.floor(Math.random() * 100), // Keep random progress for now
          imageUrl,
          imageHint,
        };
      });
      setSubjectsWithImages(subjects);
    }
  }, [dashboardData]);

  if (isLoading || !dashboardData) {
    return (
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    );
  }

  return <MySubjects subjects={subjectsWithImages} />;
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
