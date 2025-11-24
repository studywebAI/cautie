
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import type { MaterialReference } from '@/lib/teacher-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FlashcardViewer } from '@/components/tools/flashcard-viewer';
import { QuizTaker } from '@/components/tools/quiz-taker';
import { NoteViewer } from '@/components/material-viewers/note-viewer';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';


function MaterialPageContent() {
  const params = useParams();
  const { materialId } = params as { materialId: string };
  const [material, setMaterial] = useState<MaterialReference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!materialId) return;

    const fetchMaterial = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/materials/${materialId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch material');
        }
        const data: MaterialReference = await response.json();
        setMaterial(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterial();
  }, [materialId]);
  
  const renderContent = () => {
    if (!material?.content) {
      return (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Content Missing</AlertTitle>
            <AlertDescription>The content for this material could not be loaded.</AlertDescription>
        </Alert>
      )
    }
    
    switch (material.type) {
        case 'NOTE':
            return <NoteViewer notes={material.content} />;
        case 'QUIZ':
            // The Quiz type is a plain object, not a class instance, so we cast it.
            return <QuizTaker quiz={material.content} mode="practice" sourceText="" onRestart={() => {}} />;
        case 'FLASHCARDS':
            // The Flashcard array is plain objects, cast it.
            return <FlashcardViewer cards={material.content} mode="flip" onRestart={() => {}} />;
        default:
            return <p>Unsupported material type.</p>;
    }
  }


  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Material</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!material) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
        <header>
            <Button variant="ghost" asChild className="mb-4 -ml-4">
                <Link href={`/class/${material.class_id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Class
                </Link>
            </Button>
            <Badge variant="outline" className="mb-2">{material.type}</Badge>
            <h1 className="text-3xl font-bold font-headline">{material.title}</h1>
            <p className="text-sm text-muted-foreground">
              Created on {format(new Date(material.created_at), 'MMMM d, yyyy')}
            </p>
        </header>
        
         <div className="flex flex-wrap gap-2">
            {material.concepts?.map(concept => (
                <Badge key={concept.id} variant="secondary">{concept.name}</Badge>
            ))}
        </div>

       {renderContent()}
    </div>
  );
}

export default function MaterialPage() {
    return (
        <Suspense fallback={<p>Loading material...</p>}>
            <MaterialPageContent />
        </Suspense>
    )
}
