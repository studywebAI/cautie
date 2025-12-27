'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, Circle, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  assignment_index: number;
  answers_enabled: boolean;
  blocks: Array<{
    id: string;
    type: string;
    position: number;
    data: any;
  }>;
  userAnswer?: {
    id: string;
    answer_data: any;
    is_correct?: boolean;
    score?: number;
    feedback?: string;
  };
}

interface ParagraphDetail {
  id: string;
  title: string;
  paragraph_number: number;
  chapter_title: string;
  chapter_number: number;
  subject_title: string;
  progress: number;
  assignments: Assignment[];
  prevParagraph?: { id: string; title: string; number: number };
  nextParagraph?: { id: string; title: string; number: number };
}

export default function ParagraphDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    classId,
    subjectId,
    chapterId,
    paragraphId
  } = params as {
    classId: string;
    subjectId: string;
    chapterId: string;
    paragraphId: string;
  };

  const [paragraph, setParagraph] = useState<ParagraphDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    fetchParagraphDetail();
    checkTeacherRole();
  }, [classId, subjectId, chapterId, paragraphId]);

  const fetchParagraphDetail = async () => {
    try {
      const response = await fetch(
        `/api/paragraphs/${paragraphId}?classId=${classId}&subjectId=${subjectId}&chapterId=${chapterId}`
      );
      if (response.ok) {
        const data = await response.json();
        setParagraph(data.paragraph);
      }
    } catch (error) {
      console.error("Failed to fetch paragraph detail:", error);
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

  const handleAssignmentClick = (assignmentId: string) => {
    router.push(
      `/class/${classId}/subject/${subjectId}/chapter/${chapterId}/paragraph/${paragraphId}/assignment/${assignmentId}`
    );
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    const targetParagraph = direction === 'prev' ? paragraph?.prevParagraph : paragraph?.nextParagraph;
    if (targetParagraph) {
      router.push(
        `/class/${classId}/subject/${subjectId}/chapter/${chapterId}/paragraph/${targetParagraph.id}`
      );
    }
  };

  const handleBack = () => {
    router.push(`/class/${classId}/subject/${subjectId}/chapter/${chapterId}`);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="w-16 h-5" />
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

  if (!paragraph) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Paragraph not found</h2>
        <p className="text-muted-foreground mb-4">The paragraph you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to chapter
        </Button>
      </div>
    );
  }

  const completedAssignments = paragraph.assignments.filter(a => a.userAnswer?.is_correct).length;
  const totalAssignments = paragraph.assignments.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <span>{paragraph.subject_title}</span>
              <span>•</span>
              <span>Chapter {paragraph.chapter_number}: {paragraph.chapter_title}</span>
            </div>
            <h1 className="text-3xl font-bold">
              {paragraph.paragraph_number}. {paragraph.title}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Progress value={paragraph.progress} className="w-24 h-2" />
                <span className="text-sm text-muted-foreground">{paragraph.progress}% complete</span>
              </div>
              <Badge variant="outline">
                {completedAssignments}/{totalAssignments} assignments
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNavigation('prev')}
            disabled={!paragraph.prevParagraph}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNavigation('next')}
            disabled={!paragraph.nextParagraph}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Assignments</h2>
          {isTeacher && (
            <Button size="sm">
              <Play className="w-4 h-4 mr-2" />
              Add Assignment
            </Button>
          )}
        </div>

        {paragraph.assignments.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Play className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No assignments yet</h3>
                <p className="text-muted-foreground">
                  {isTeacher
                    ? "Create assignments to start building interactive content for this paragraph."
                    : "Your teacher hasn't created any assignments yet."
                  }
                </p>
              </div>
              {isTeacher && (
                <Button>
                  <Play className="w-4 h-4 mr-2" />
                  Create First Assignment
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paragraph.assignments.map((assignment) => (
              <Card
                key={assignment.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleAssignmentClick(assignment.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-mono text-lg px-3 py-1">
                      {assignmentIndexToLetter(assignment.assignment_index)}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {assignment.userAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                  <CardTitle className="text-base line-clamp-2">{assignment.title}</CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{assignment.blocks.length} blocks</span>
                    {assignment.userAnswer && (
                      <div className="flex items-center gap-1">
                        {assignment.userAnswer.score !== undefined && (
                          <span className="font-medium">
                            {assignment.userAnswer.score}/100
                          </span>
                        )}
                        {assignment.userAnswer.is_correct && (
                          <Badge variant="secondary" className="text-xs">
                            Correct
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}