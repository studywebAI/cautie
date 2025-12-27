"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Target, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Subject {
  id: string;
  title: string;
  class_label?: string;
  cover_type: string;
  cover_image_url?: string;
  ai_icon_seed?: string;
  overallProgress: number;
  currentParagraphs: Array<{
    id: string;
    title: string;
    chapterNumber: number;
    paragraphNumber: number;
    progress: number;
  }>;
  totalChapters: number;
  totalParagraphs: number;
}

interface SubjectsGridProps {
  classId: string;
  isTeacher: boolean;
}

export function SubjectsGrid({ classId, isTeacher }: SubjectsGridProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSubjects();
  }, [classId]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/subjects?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectIcon = (subject: Subject) => {
    if (subject.cover_type === "image" && subject.cover_image_url) {
      return (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
          <Image
            src={subject.cover_image_url}
            alt={subject.title}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    // AI-generated icon placeholder - in a real app this would generate from seed
    return (
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <BookOpen className="w-6 h-6 text-white" />
      </div>
    );
  };

  const handleSubjectClick = (subjectId: string) => {
    router.push(`/class/${classId}/subject/${subjectId}`);
  };

  const handleCreateSubject = () => {
    router.push(`/class/${classId}/create-subject`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="w-16 h-6 bg-muted rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="w-3/4 h-4 bg-muted rounded" />
                <div className="w-1/2 h-3 bg-muted rounded" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-full h-2 bg-muted rounded" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Learning Subjects</h2>
          <p className="text-muted-foreground">Explore and continue your learning journey</p>
        </div>
        {isTeacher && (
          <Button onClick={handleCreateSubject}>
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        )}
      </div>

      {subjects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No subjects yet</h3>
              <p className="text-muted-foreground">
                {isTeacher
                  ? "Create your first subject to start organizing your learning content."
                  : "Your teacher hasn't created any subjects yet."
                }
              </p>
            </div>
            {isTeacher && (
              <Button onClick={handleCreateSubject}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Subject
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleSubjectClick(subject.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  {getSubjectIcon(subject)}
                  <div className="flex items-center space-x-2">
                    {subject.class_label && (
                      <Badge variant="secondary" className="text-xs">
                        {subject.class_label}
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{subject.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Overview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{subject.overallProgress}%</span>
                  </div>
                  <Progress value={subject.overallProgress} className="h-2" />
                </div>

                {/* Current Paragraphs Preview */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Target className="w-3 h-3 mr-1" />
                    Current Focus
                  </div>
                  <div className="space-y-1.5">
                    {subject.currentParagraphs.slice(0, 3).map((paragraph) => (
                      <div key={paragraph.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate flex-1 mr-2">
                          {paragraph.chapterNumber}.{paragraph.paragraphNumber} {paragraph.title}
                        </span>
                        <div className="flex items-center space-x-1">
                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${paragraph.progress}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground w-8 text-right">
                            {paragraph.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>{subject.totalChapters} chapters</span>
                  <span>{subject.totalParagraphs} paragraphs</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}