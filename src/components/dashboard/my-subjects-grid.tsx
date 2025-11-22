'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Subject } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";


// Helper function to get image details for a subject
function getSubjectImage(subjectName: string): { imageUrl: string, imageHint: string } {
    const subjectId = `subject-icon-${subjectName.toLowerCase().replace(/ /g, '-')}`;
    const image = PlaceHolderImages.find(img => img.id === subjectId);
    
    // Return a default if no image is found to prevent build errors, though we expect all images to exist.
    return image || {
        imageUrl: `https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?q=80&w=1974&auto=format&fit=crop`,
        imageHint: 'default books'
    };
}


type MySubjectsGridProps = {
  subjects: Subject[];
};

export function MySubjectsGrid({ subjects }: MySubjectsGridProps) {
  const subjectsWithImages = subjects.map((subject) => {
    const { imageUrl, imageHint } = getSubjectImage(subject.name);
    return {
      ...subject,
      imageUrl,
      imageHint,
    };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjectsWithImages.map((subject) => (
          <Link key={subject.id} href="#" className="group">
            <Card className="h-full transition-all duration-200 group-hover:border-primary group-hover:shadow-lg flex flex-col">
              <CardHeader className="p-4 flex-grow-0">
                <div className="relative h-32 w-full rounded-md overflow-hidden mb-4">
                  <Image
                    src={subject.imageUrl}
                    alt={subject.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover w-full h-full"
                    data-ai-hint={subject.imageHint}
                  />
                </div>
                <CardTitle className="text-lg">{subject.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-grow">
                <div className="flex items-center gap-2">
                  <Progress value={subject.progress} className="h-2" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {subject.progress}%
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-end items-center gap-1">
                <span>View Subject</span>
                <ArrowRight className="h-4 w-4" />
              </CardFooter>
            </Card>
          </Link>
        ))}
    </div>
  );
}
