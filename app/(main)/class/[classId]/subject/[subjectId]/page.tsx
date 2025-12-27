'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, Target, ChevronRight, Plus } from 'lucide-react';
import Image from 'next/image';

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  ai_summary?: string;
  summary_overridden: boolean;
  paragraphs: Array<{
    id: string;
    title: string;
    paragraph_number: number;
    progress?: number;
  }>;
}

interface SubjectDetail {
  id: string;
  title: string;
  class_label?: string;
  cover_type: string;
  cover_image_url?: string;
  ai_icon_seed?: string;
  chapters: Chapter[];
  overallProgress: number;
  totalParagraphs: number;
}

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { classId, subjectId } = params as { classId: string; subjectId: string };

  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    fetchSubjectDetail();
    checkTeacherRole();
  }, [classId, subjectId]);

  const fetchSubjectDetail = async () => {
    try {
      const response = await fetch(`/api/subjects/${subjectId}?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setSubject(data.subject);
      }
    } catch (error) {
      console.error("Failed to fetch subject detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkTeacherRole = async () => {
    try {
      const response = await fetch('/api/user/role');
      if (response.ok) {
        const data = await response.json();
        setIsTeacher(data.role === 'teacher');
      }
    } catch (error) {
      console.error("Failed to check role:", error);
    }
  };

  const getSubjectIcon = () => {
    if (!subject) return null;

    if (subject.cover_type === "image" && subject.cover_image_url) {
      return (
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
          <Image
            src={subject.cover_image_url}
            alt={subject.title}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    // AI-generated icon placeholder
    return (
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-white" />
      </div>
    );
  };

  const handleChapterClick = (chapterId: string) => {
    router.push(`/class/${classId}/subject/${subjectId}/chapter/${chapterId}`);
  };

  const handleBack = () => {
    router.push(`/class/${classId}?view=subjects`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-full h-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Subject not found</h2>
        <p className="text-muted-foreground mb-4">The subject you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to subjects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mt-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-start gap-4 flex-1">
          {getSubjectIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{subject.title}</h1>
              {subject.class_label && (
                <Badge variant="secondary">{subject.class_label}</Badge>
              )}
            </div>

            <div className="flex items-center gap-6 text-muted-foreground mb-4">
              <span>{subject.chapters.length} chapters</span>
              <span>{subject.totalParagraphs} paragraphs</span>
              <div className="flex items-center gap-2">
                <span>Progress:</span>
                <Progress value={subject.overallProgress} className="w-24 h-2" />
                <span className="text-sm font-medium">{subject.overallProgress}%</span>
              </div>
            </div>
          </div>

          {isTeacher && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          )}
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subject.chapters.map((chapter) => (
          <Card
            key={chapter.id}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleChapterClick(chapter.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-muted-foreground font-normal">
                      Chapter {chapter.chapter_number}
                    </span>
                    <span className="text-foreground">{chapter.title}</span>
                  </CardTitle>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* AI Summary */}
              {chapter.ai_summary && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {chapter.ai_summary}
                </p>
              )}

              {/* Progress Preview */}
              <div className="space-y-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Target className="w-3 h-3 mr-1" />
                  Recent paragraphs
                </div>
                <div className="space-y-1">
                  {chapter.paragraphs.slice(0, 3).map((paragraph) => (
                    <div key={paragraph.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground truncate">
                        {paragraph.paragraph_number}. {paragraph.title}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${paragraph.progress || 0}%` }}
                          />
                        </div>
                        <span className="w-6 text-right">{paragraph.progress || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>{chapter.paragraphs.length} paragraphs</span>
                <span>
                  Completed: {chapter.paragraphs.filter(p => (p.progress || 0) >= 80).length}/{chapter.paragraphs.length}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {subject.chapters.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No chapters yet</h3>
              <p className="text-muted-foreground">
                {isTeacher
                  ? "Create your first chapter to start organizing content for this subject."
                  : "Your teacher hasn't created any chapters yet."
                }
              </p>
            </div>
            {isTeacher && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Chapter
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}