'use client';

import React, { useState, useContext } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, BookOpen } from 'lucide-react';
import { AppContext, AppContextType } from '@/contexts/app-context';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Subject = {
  id: string;
  title: string;
  content?: {
    class_label?: string;
    cover_type?: string;
    cover_image_url?: string;
    ai_icon_seed?: string;
  };
  created_at: string;
};

type SubjectsGridProps = {
  classId: string;
  isTeacher?: boolean;
};

export function SubjectsGrid({ classId, isTeacher = true }: SubjectsGridProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Fetch subjects on mount
  React.useEffect(() => {
    fetchSubjects();
  }, [classId]);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/classes/${classId}/subjects`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load subjects.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubjectTitle.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing title',
        description: 'Please provide a title for the subject.',
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`/api/classes/${classId}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSubjectTitle,
          class_label: newSubjectTitle,
          cover_type: 'ai_icons',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subject');
      }

      const newSubject = await response.json();
      setSubjects(prev => [newSubject, ...prev]);
      setNewSubjectTitle('');
      setIsCreateOpen(false);

      toast({
        title: 'Subject Created',
        description: `"${newSubject.title}" has been added to your class.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Creating Subject',
        description: error.message,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const generatePlaceholderIcon = (seed?: string) => {
    // Simple deterministic icon generation based on seed
    const icons = ['📚', '🎓', '📖', '🔬', '🎨', '🌍', '⚡', '🔥', '💡', '🎯'];
    const index = seed ? seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % icons.length : 0;
    return icons[index];
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="aspect-[4/3] bg-muted rounded-lg mb-4" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {isTeacher && (
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Subjects</h2>
              <p className="text-muted-foreground">Organize your class content into structured subjects</p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Subject
            </Button>
          </div>
        )}

        {subjects.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subjects yet</h3>
            <p className="text-muted-foreground mb-4">
              {isTeacher
                ? "Create your first subject to start organizing your class content."
                : "Your teacher hasn't created any subjects yet."
              }
            </p>
            {isTeacher && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First Subject
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card key={subject.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/class/${classId}/subject/${subject.id}`}>
                  <CardContent className="p-0">
                    {/* Top half - Cover/Icon */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                      {subject.content?.cover_image_url ? (
                        <img
                          src={subject.content.cover_image_url}
                          alt={subject.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-6xl">
                          {generatePlaceholderIcon(subject.content?.ai_icon_seed)}
                        </div>
                      )}

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Bottom half - Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {subject.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-3">
                        {subject.content?.class_label || subject.title}
                      </p>

                      {/* Progress preview - placeholder for now */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Chapter 1.1</span>
                          <span className="font-medium">0%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full w-0 transition-all duration-300" />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Chapter 1.2</span>
                          <span className="font-medium">0%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full w-0 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Subject Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Create a new subject to organize your class content. You can add chapters, paragraphs, and assignments to structure your curriculum.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject-title">Subject Title</Label>
              <Input
                id="subject-title"
                placeholder="e.g., Nederlands, Mathematics, History"
                value={newSubjectTitle}
                onChange={(e) => setNewSubjectTitle(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubject} disabled={isCreating || !newSubjectTitle.trim()}>
              {isCreating ? 'Creating...' : 'Create Subject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}