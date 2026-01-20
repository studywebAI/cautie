'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, AlertCircle, PlusCircle } from 'lucide-react';
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
  const [showStudentView, setShowStudentView] = useState(false);
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

  const handleAddBlock = async (blockType: string) => {
    if (!assignment) return;

    try {
      // Get the next position
      const maxPosition = blocks.length > 0 ? Math.max(...blocks.map(b => b.position)) : 0;
      const nextPosition = maxPosition + 1;

      // Create default data based on block type
      let defaultData = {};
      switch (blockType) {
        case 'text':
          defaultData = { content: 'Enter your text here...', style: 'normal' };
          break;
        case 'multiple_choice':
          defaultData = {
            question: 'Enter your question here',
            options: [
              { id: 'a', text: 'Option A', correct: false },
              { id: 'b', text: 'Option B', correct: false },
              { id: 'c', text: 'Option C', correct: true },
              { id: 'd', text: 'Option D', correct: false }
            ],
            multiple_correct: false,
            shuffle: true
          };
          break;
        case 'open_question':
          defaultData = {
            question: 'Enter your question here',
            ai_grading: true,
            grading_criteria: 'Check for accuracy and completeness',
            max_length: 1000
          };
          break;
        case 'image':
          defaultData = { url: '', caption: 'Image caption', transform: { x: 0, y: 0, scale: 1, rotation: 0 } };
          break;
        case 'video':
          defaultData = { url: '', provider: 'youtube', start_seconds: 0, end_seconds: null };
          break;
        case 'divider':
          defaultData = { style: 'line' };
          break;
        default:
          defaultData = {};
      }

      const response = await fetch(
        `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments/${assignmentId}/blocks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: blockType,
            position: nextPosition,
            data: defaultData
          })
        }
      );

      if (response.ok) {
        const newBlock = await response.json();
        setBlocks(prev => [...prev, newBlock].sort((a, b) => a.position - b.position));
        toast({
          title: 'Block Added',
          description: `${blockType} block has been added to the assignment.`,
        });
      } else {
        throw new Error('Failed to add block');
      }
    } catch (error) {
      console.error('Error adding block:', error);
      toast({
        title: 'Error',
        description: 'Failed to add block.',
        variant: 'destructive'
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, blockType: string) => {
    e.dataTransfer.setData('text/plain', blockType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('text/plain');

    if (blockType) {
      await handleAddBlock(blockType);
    }
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
      readOnly: isTeacher && !showStudentView
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
            <div className="flex gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    🎯 Apply Preset
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72">
                  <DropdownMenuLabel>Assignment Templates</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ASSIGNMENT_PRESETS.map((preset) => (
                    <DropdownMenuItem
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="flex items-start gap-3 p-3"
                    >
                      <span className="text-lg">{preset.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-sm text-muted-foreground">{preset.description}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Block
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Block Types</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAddBlock('text')}>
                    📝 Text Block
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddBlock('multiple_choice')}>
                    ✅ Multiple Choice
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddBlock('open_question')}>
                    ❓ Open Question
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddBlock('image')}>
                    🖼️ Image Block
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddBlock('video')}>
                    🎥 Video Block
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAddBlock('divider')}>
                    ― Divider
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={() => setShowStudentView(!showStudentView)}>
                👁️ {showStudentView ? 'Teacher View' : 'Student View'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit Assignment</Button>
              <Button variant="outline">View Submissions</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}