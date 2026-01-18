'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppContext } from '@/contexts/app-context';
import { useContext } from 'react';
import Link from 'next/link';
import { SimpleTextBlock } from '@/components/blocks/SimpleTextBlock';
import { SimpleMultipleChoiceBlock } from '@/components/blocks/SimpleMultipleChoiceBlock';
import { SimpleOpenQuestionBlock } from '@/components/blocks/SimpleOpenQuestionBlock';

type Assignment = {
  id: string;
  title: string;
  letter_index: string;
  answers_enabled: boolean;
};

type Block = {
  id: string;
  type: string;
  position: number;
  data: any;
};

type StudentAnswer = {
  block_id: string;
  answer_data: any;
  is_correct?: boolean;
  score?: number;
  feedback?: string;
};

export default function AssignmentDetailPage() {
  const params = useParams();
  const { subjectId, chapterId, paragraphId, assignmentId } = params as {
    subjectId: string;
    chapterId: string;
    paragraphId: string;
    assignmentId: string;
  };
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, StudentAnswer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { role } = useContext(AppContext) as any;
  const isTeacher = role === 'teacher';

  // Fetch assignment and blocks
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assignment info
        const assignmentsResponse = await fetch(
          `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments`
        );
        if (assignmentsResponse.ok) {
          const assignments = await assignmentsResponse.json();
          const currentAssignment = assignments.find((a: Assignment) => a.id === assignmentId);
          if (currentAssignment) {
            setAssignment(currentAssignment);
          }
        }

        // Fetch blocks for this assignment
        const blocksResponse = await fetch(
          `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments/${assignmentId}/blocks`
        );
        if (blocksResponse.ok) {
          const blocksData = await blocksResponse.json();
          setBlocks(blocksData.sort((a: Block, b: Block) => a.position - b.position));
        }

        // If student, fetch their answers
        if (!isTeacher) {
          const answersResponse = await fetch(
            `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments/${assignmentId}/answers`
          );
          if (answersResponse.ok) {
            const answersData = await answersResponse.json();
            const answersMap = answersData.reduce((acc: Record<string, StudentAnswer>, answer: any) => {
              acc[answer.block_id] = {
                block_id: answer.block_id,
                answer_data: answer.answer_data,
                is_correct: answer.is_correct,
                score: answer.score,
                feedback: answer.feedback
              };
              return acc;
            }, {});
            setStudentAnswers(answersMap);
          }
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
  }, [subjectId, chapterId, paragraphId, assignmentId, isTeacher, toast]);

  const handleBlockAnswer = (blockId: string, answerData: any) => {
    setStudentAnswers(prev => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        block_id: blockId,
        answer_data: answerData
      }
    }));
  };

  const handleSubmit = async () => {
    if (isTeacher) return;

    setIsSubmitting(true);
    try {
      const answersToSubmit = Object.values(studentAnswers);

      const response = await fetch(
        `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments/${assignmentId}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: answersToSubmit })
        }
      );

      if (response.ok) {
        toast({
          title: 'Assignment Submitted',
          description: 'Your answers have been submitted successfully.',
        });
      } else {
        throw new Error('Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit assignment.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBlock = (block: Block) => {
    const commonProps = {
      key: block.id,
      block: block,
      answer: studentAnswers[block.id],
      onAnswer: handleBlockAnswer,
      isTeacher,
      readOnly: isTeacher
    };

    switch (block.type) {
      case 'text':
        return <SimpleTextBlock {...commonProps} />;
      case 'multiple_choice':
        return <SimpleMultipleChoiceBlock {...commonProps} />;
      case 'open_question':
        return <SimpleOpenQuestionBlock {...commonProps} />;
      default:
        return (
          <div key={block.id} className="w-full p-4 border rounded-lg">
            <p className="text-muted-foreground">Unsupported block type: {block.type}</p>
          </div>
        );
    }
  };

  if (!assignment) {
    return <div>Loading...</div>;
  }

  const allBlocksAnswered = blocks.length > 0 && blocks.every(block =>
    studentAnswers[block.id]?.answer_data != null
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
              {assignment.letter_index}
            </span>
            {assignment.title}
          </h1>
          <p className="text-muted-foreground">
            {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
            {assignment.answers_enabled && ' • Answers enabled'}
          </p>
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-6">
        {blocks.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No content yet</h3>
            <p className="text-muted-foreground">
              {isTeacher
                ? "Add blocks to this assignment to create content."
                : "This assignment has no content yet."
              }
            </p>
          </Card>
        ) : (
          blocks.map(renderBlock)
        )}
      </div>

      {/* Submit Button */}
      {!isTeacher && blocks.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!allBlocksAnswered || isSubmitting}
            size="lg"
            className="px-8"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
            {!allBlocksAnswered && (
              <span className="ml-2 text-sm">
                ({blocks.length - Object.keys(studentAnswers).length} remaining)
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Teacher Actions */}
      {isTeacher && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Teacher Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Add Block</Button>
            <Button variant="outline">Edit Assignment</Button>
            <Button variant="outline">View Submissions</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}