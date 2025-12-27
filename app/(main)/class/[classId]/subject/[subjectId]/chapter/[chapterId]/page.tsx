'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, Target, ChevronRight, CheckCircle, Circle } from 'lucide-react';

interface Paragraph {
  id: string;
  title: string;
  paragraph_number: number;
  progress: number;
  assignments: Array<{
    id: string;
    title: string;
    assignment_index: number;
    answers_enabled: boolean;
  }>;
}

interface ChapterDetail {
  id: string;
  title: string;
  chapter_number: number;
  ai_summary?: string;
  summary_overridden: boolean;
  paragraphs: Paragraph[];
}

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { classId, subjectId, chapterId } = params as {
    classId: string;
    subjectId: string;
    chapterId: string;
  };

  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    fetchChapterDetail();
    checkTeacherRole();
  }, [classId, subjectId, chapterId]);

  const fetchChapterDetail = async () => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}?classId=${classId}&subjectId=${subjectId}`);
      if (response.ok) {
        const data = await response.json();
        setChapter(data.chapter);
      }
    } catch (error) {
      console.error("Failed to fetch chapter detail:", error);
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

  const handleParagraphClick = (paragraphId: string) => {
    router.push(`/class/${classId}/subject/${subjectId}/chapter/${chapterId}/paragraph/${paragraphId}`);
  };

  const handleBack = () => {
    router.push(`/class/${classId}/subject/${subjectId}`);
  };

  const assignmentIndexToLetter = (index: number): string => {
    if (index < 26) {
      return String.fromCharCode(97 + index); // a-z
    }

    let result = '';
    let remainder = index;

    while (remainder >= 0) {
      const digit = remainder % 26;
      result = String.fromCharCode(97 + digit) + result;
      remainder = Math.floor(remainder / 26) - 1;
      if (remainder < 0) break;
    }

    return result;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-full h-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Chapter not found</h2>
        <p className="text-muted-foreground mb-4">The chapter you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to subject
        </Button>
      </div>
    );
  }

  const completedParagraphs = chapter.paragraphs.filter(p => p.progress >= 80).length;
  const totalParagraphs = chapter.paragraphs.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">
              Chapter {chapter.chapter_number}: {chapter.title}
            </h1>
            <Badge variant="outline">
              {completedParagraphs}/{totalParagraphs} completed
            </Badge>
          </div>

          <div className="flex items-center gap-6 text-muted-foreground mb-4">
            <span>{totalParagraphs} paragraphs</span>
            <div className="flex items-center gap-2">
              <span>Progress:</span>
              <Progress
                value={totalParagraphs > 0 ? (completedParagraphs / totalParagraphs) * 100 : 0}
                className="w-24 h-2"
              />
              <span className="text-sm font-medium">
                {Math.round(totalParagraphs > 0 ? (completedParagraphs / totalParagraphs) * 100 : 0)}%
              </span>
            </div>
          </div>

          {chapter.ai_summary && (
            <p className="text-muted-foreground max-w-3xl">
              {chapter.ai_summary}
            </p>
          )}
        </div>
      </div>

      {/* Paragraphs List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Paragraphs</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {chapter.paragraphs.map((paragraph) => (
            <Card
              key={paragraph.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleParagraphClick(paragraph.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Progress indicator */}
                    <div className="flex-shrink-0 mt-1">
                      {paragraph.progress >= 80 ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">
                          {paragraph.paragraph_number}. {paragraph.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Progress value={paragraph.progress} className="w-16 h-2" />
                          <span className="text-sm text-muted-foreground w-10">
                            {paragraph.progress}%
                          </span>
                        </div>
                      </div>

                      {/* Assignments preview */}
                      {paragraph.assignments.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Assignments:</span>
                          {paragraph.assignments.slice(0, 5).map((assignment, index) => (
                            <Badge key={assignment.id} variant="outline" className="text-xs">
                              {assignmentIndexToLetter(assignment.assignment_index)}
                            </Badge>
                          ))}
                          {paragraph.assignments.length > 5 && (
                            <span className="text-xs">
                              +{paragraph.assignments.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {chapter.paragraphs.length === 0 && (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">No paragraphs yet</h3>
                <p className="text-muted-foreground">
                  {isTeacher
                    ? "Create paragraphs to start building content for this chapter."
                    : "Your teacher hasn't created any paragraphs yet."
                  }
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}