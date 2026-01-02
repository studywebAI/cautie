'use client';

import { useParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Play, CheckCircle } from 'lucide-react';
import Link from 'next/link';

type Subject = {
  id: string;
  title: string;
  content?: {
    class_label?: string;
    cover_type?: string;
    cover_image_url?: string;
    ai_icon_seed?: string;
  };
  recentParagraphs?: Array<{
    id: string;
    title: string;
    progress: number;
  }>;
  created_at: string;
};

export default function SubjectDetailPage() {
  const params = useParams();
  const { classId, subjectId } = params as { classId: string; subjectId: string };
  const { classes, role } = useContext(AppContext) as AppContextType;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chapters, setChapters] = useState<any[]>([]);

  const classInfo = classes.find(c => c.id === classId);
  const isTeacher = role === 'teacher';

  useEffect(() => {
    fetchSubjectData();
  }, [subjectId, classId]);

  const fetchSubjectData = async () => {
    try {
      setIsLoading(true);

      // Fetch subject details
      const subjectResponse = await fetch(`/api/classes/${classId}/subjects`);
      if (!subjectResponse.ok) throw new Error('Failed to fetch subject');
      const subjects = await subjectResponse.json();
      const currentSubject = subjects.find((s: Subject) => s.id === subjectId);

      if (!currentSubject) throw new Error('Subject not found');

      setSubject(currentSubject);

      // For now, we'll show some placeholder chapters
      // TODO: Replace with real chapter data when hierarchical schema is deployed
      setChapters([
        {
          id: '1',
          title: 'Chapter 1: Introduction',
          summary: 'Basic concepts and foundational knowledge for this subject.',
          paragraphs: [
            { id: '1.1', title: 'Welcome & Overview', progress: currentSubject.recentParagraphs?.[0]?.progress || 0 },
            { id: '1.2', title: 'Key Terminology', progress: currentSubject.recentParagraphs?.[1]?.progress || 0 },
            { id: '1.3', title: 'Getting Started', progress: currentSubject.recentParagraphs?.[2]?.progress || 0 }
          ]
        },
        {
          id: '2',
          title: 'Chapter 2: Core Concepts',
          summary: 'Dive deeper into the fundamental principles and theories.',
          paragraphs: [
            { id: '2.1', title: 'Fundamental Principles', progress: 45 },
            { id: '2.2', title: 'Practical Applications', progress: 30 },
            { id: '2.3', title: 'Common Patterns', progress: 15 }
          ]
        }
      ]);
    } catch (error) {
      console.error('Error fetching subject data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!subject || !classInfo) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Subject not found</h2>
        <p className="text-muted-foreground mb-6">
          The subject you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button asChild>
          <Link href={`/class/${classId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Class
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/class/${classId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{subject.title}</h1>
          <p className="text-muted-foreground">{classInfo.name} • {subject.content?.class_label || subject.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chapters Overview */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Chapters</h2>

          {chapters.map((chapter) => (
            <Card key={chapter.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{chapter.title}</span>
                  {isTeacher && (
                    <Button variant="outline" size="sm">
                      Edit Chapter
                    </Button>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{chapter.summary}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chapter.paragraphs.map((paragraph: any) => (
                    <div key={paragraph.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{paragraph.id}</span>
                          <span className="text-sm">{paragraph.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3" />
                          {paragraph.progress}% complete
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${paragraph.progress}%` }}
                          />
                        </div>
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3 mr-1" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Subject Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>23%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-primary h-3 rounded-full w-1/4 transition-all duration-300" />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Last active: Today</p>
                  <p>Time spent: 45 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {isTeacher && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teacher Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  Add Chapter
                </Button>
                <Button className="w-full" variant="outline">
                  View Analytics
                </Button>
                <Button className="w-full" variant="outline">
                  Manage Assignments
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}