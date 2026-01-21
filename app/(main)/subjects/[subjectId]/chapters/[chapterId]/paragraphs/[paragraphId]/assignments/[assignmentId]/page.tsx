'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppContext } from '@/contexts/app-context';
import { useContext } from 'react';
import Link from 'next/link';
import { BlockRenderer } from '@/components/blocks';

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
  const [isSubmitted, setIsSubmitted] = useState(false);
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
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {String.fromCharCode(97 + assignment.assignment_index)}. {assignment.title}
            </h1>
            <p className="text-muted-foreground">Assignment in paragraph</p>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex items-center gap-2">
          {/* Placeholder for navigation dots - would need to fetch all assignments */}
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <div className="w-3 h-3 rounded-full bg-muted"></div>
            <div className="w-3 h-3 rounded-full bg-muted"></div>
          </div>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-6">
        {blocks.map((block, index) => (
          <Card key={block.id}>
            <CardContent className="p-6">
              <BlockRenderer
                block={block}
                onSubmit={(answerData) => handleBlockSubmit(block.id, answerData)}
                submitted={isSubmitted}
                isStudent={isStudent}
                isTeacher={isTeacher}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation between assignments */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous Assignment
        </Button>
        <Button>
          Next Assignment
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}