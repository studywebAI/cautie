'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, BookOpen, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AppContext } from '@/contexts/app-context';
import { useContext } from 'react';
import Link from 'next/link';

type Assignment = {
  id: string;
  title: string;
  letter_index: string;
  assignment_index: number;
  block_count: number;
  answers_enabled: boolean;
};

type Paragraph = {
  id: string;
  title: string;
  paragraph_number: number;
};

export default function ParagraphDetailPage() {
  const params = useParams();
  const { subjectId, chapterId, paragraphId } = params as {
    subjectId: string;
    chapterId: string;
    paragraphId: string;
  };
  const [paragraph, setParagraph] = useState<Paragraph | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const { toast } = useToast();
  const { role } = useContext(AppContext) as any;
  const isTeacher = role === 'teacher';

  // Fetch paragraph and assignments
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch paragraph info
        const paragraphResponse = await fetch(`/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs`);
        if (paragraphResponse.ok) {
          const paragraphs = await paragraphResponse.json();
          const currentParagraph = paragraphs.find((p: Paragraph) => p.id === paragraphId);
          if (currentParagraph) {
            setParagraph(currentParagraph);
          }
        }

        // Fetch assignments
        const assignmentsResponse = await fetch(
          `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments`
        );
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          setAssignments(assignmentsData);
        }
      } catch (error) {
        console.error('Error fetching paragraph data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load paragraph data.',
          variant: 'destructive'
        });
      }
    };

    fetchData();
  }, [subjectId, chapterId, paragraphId, toast]);

  if (!paragraph) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/subjects/${subjectId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {paragraph.paragraph_number}. {paragraph.title}
          </h1>
          <p className="text-muted-foreground">Assignments in this paragraph</p>
        </div>
      </div>

      {/* Assignments Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Assignments</h2>
        {isTeacher && (
          <Button onClick={() => setIsCreateAssignmentOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Assignment
          </Button>
        )}
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
            <p className="text-muted-foreground mb-4">
              {isTeacher
                ? "Create the first assignment for this paragraph."
                : "Your teacher hasn't created any assignments yet."
              }
            </p>
            {isTeacher && (
              <Button onClick={() => setIsCreateAssignmentOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First Assignment
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                      {assignment.letter_index}
                    </span>
                    {assignment.title}
                  </CardTitle>
                  <CardDescription>
                    {assignment.block_count} blocks •
                    {assignment.answers_enabled ? ' Answers enabled' : ' Answers disabled'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    View Assignment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Assignment Dialog */}
      <Dialog open={isCreateAssignmentOpen} onOpenChange={setIsCreateAssignmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Assignment</DialogTitle>
            <DialogDescription>
              Create a new assignment for this paragraph.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assignment-title">Assignment Title</Label>
              <Input id="assignment-title" placeholder="e.g., Basic Concepts Quiz" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateAssignmentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              const titleInput = document.getElementById('assignment-title') as HTMLInputElement;

              if (!titleInput?.value?.trim()) {
                toast({
                  title: 'Error',
                  description: 'Assignment title is required.',
                  variant: 'destructive'
                });
                return;
              }

              try {
                const response = await fetch(
                  `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: titleInput.value.trim(),
                      answers_enabled: false
                    })
                  }
                );

                if (response.ok) {
                  const newAssignment = await response.json();
                  setAssignments(prev => [...prev, newAssignment]);
                  toast({
                    title: 'Assignment Created',
                    description: 'The new assignment has been added to the paragraph.',
                  });
                  setIsCreateAssignmentOpen(false);
                  titleInput.value = '';
                } else {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to create assignment');
                }
              } catch (error) {
                console.error('Error creating assignment:', error);
                toast({
                  title: 'Error',
                  description: error instanceof Error ? error.message : 'Failed to create assignment. Please try again.',
                  variant: 'destructive'
                });
              }
            }}>
              Create Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}