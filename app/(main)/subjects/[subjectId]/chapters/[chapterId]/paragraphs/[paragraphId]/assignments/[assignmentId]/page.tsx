'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppContext } from '@/contexts/app-context';
import { useContext } from 'react';
import Link from 'next/link';
import { StudentBlockRenderer } from '@/components/blocks/StudentBlockRenderer';
import { AssignmentEditor } from '@/components/AssignmentEditor';

type Assignment = {
  id: string;
  title: string;
  assignment_index: number;
  answers_enabled: boolean;
};

type Block = {
  id: string;
  type: string;
  position: number;
  data: any;
};

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { subjectId, chapterId, paragraphId, assignmentId } = params as any;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const { toast } = useToast();
  const { role } = useContext(AppContext) as any;
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assignment
        const assignmentResponse = await fetch(
          `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments/${assignmentId}`
        );
        if (assignmentResponse.ok) {
          const assignmentData = await assignmentResponse.json();
          setAssignment(assignmentData);
        }

        // Fetch blocks
        const blocksResponse = await fetch(
          `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments/${assignmentId}/blocks`
        );
        if (blocksResponse.ok) {
          const blocksData = await blocksResponse.json();
          setBlocks(blocksData.sort((a: Block, b: Block) => a.position - b.position));
        }
      } catch (error) {
        console.error('Error fetching assignment data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load assignment.',
          variant: 'destructive'
        });
      }
    };

    fetchData();
  }, [subjectId, chapterId, paragraphId, assignmentId, toast]);

  const handleBlockSubmit = async (blockId: string, answerData: any) => {
    try {
      const response = await fetch(
        `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments/${assignmentId}/blocks/${blockId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answerData })
        }
      );

      if (response.ok) {
        toast({
          title: 'Answer Submitted',
          description: 'Your answer has been saved.',
        });
        setIsSubmitted(true);
      } else {
        throw new Error('Failed to submit answer');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit answer.',
        variant: 'destructive'
      });
    }
  };

  if (!assignment) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading assignment...</p>
      </div>
    </div>;
  }

  // Show AssignmentEditor for teachers, student view for students
  if (isTeacher) {
    return (
      <AssignmentEditor
        assignmentId={assignmentId}
        subjectId={subjectId}
        chapterId={chapterId}
        paragraphId={paragraphId}
        initialBlocks={blocks}
        onSave={(savedBlocks) => {
          // Refresh blocks after save
          setBlocks(savedBlocks);
        }}
        onPreview={() => {
          // Could switch to preview mode
        }}
      />
    );
  }

  // Student view
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {String.fromCharCode(97 + assignment.assignment_index)}. {assignment.title}
          </h1>
          <p className="text-muted-foreground">Complete the assignment below</p>
        </div>
      </div>

      {/* Assignment blocks for students */}
      <div className="space-y-6">
        {blocks.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No content yet</h3>
            <p className="text-muted-foreground">
              The teacher hasn't added any content to this assignment yet.
            </p>
          </Card>
        ) : (
          blocks.map((block, index) => (
            <Card key={block.id} className="shadow-sm">
              <CardContent className="p-6">
                <StudentBlockRenderer
                  block={block as any}
                  onSubmit={(answerData: any) => handleBlockSubmit(block.id, answerData)}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Navigation between assignments */}
      {blocks.length > 0 && (
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Assignment
          </Button>
          <Button disabled>
            Next Assignment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}