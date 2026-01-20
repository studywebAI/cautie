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
  console.log('Raw params on mount:', params);

  const { subjectId, chapterId, paragraphId, assignmentId } = params as {
    subjectId: string;
    chapterId: string;
    paragraphId: string;
    assignmentId: string;
  };
  console.log('Extracted params on mount:', { subjectId, chapterId, paragraphId, assignmentId });
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, StudentAnswer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStudentView, setShowStudentView] = useState(false);
  const [lastBlockChange, setLastBlockChange] = useState<number>(0);
  const { toast } = useToast();
  const { role } = useContext(AppContext) as any;
  const isTeacher = role === 'teacher';

  // Fetch assignment and blocks
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assignment info
        console.log(`Fetching assignments for paragraph: ${paragraphId}`);
        const assignmentsResponse = await fetch(
          `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments`
        );
        console.log(`Assignments response status: ${assignmentsResponse.status}`);

        if (assignmentsResponse.ok) {
          const assignments = await assignmentsResponse.json();
          console.log(`Found ${assignments.length} assignments:`, assignments.map((a: any) => ({ id: a.id, title: a.title })));
          const currentAssignment = assignments.find((a: Assignment) => a.id === assignmentId);
          console.log(`Looking for assignment with ID: ${assignmentId}`);
          console.log(`Current assignment found:`, currentAssignment);

          if (currentAssignment) {
            setAssignment(currentAssignment);
          } else {
            console.error(`Assignment ${assignmentId} not found in assignments list`);
            toast({
              title: 'Assignment Not Found',
              description: `Could not find assignment with ID ${assignmentId}`,
              variant: 'destructive'
            });
          }
        } else {
          const errorText = await assignmentsResponse.text();
          console.error(`Failed to fetch assignments: ${errorText}`);
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

  // Auto-save blocks every 10 minutes (600,000 ms) - only for teachers
  useEffect(() => {
    if (!isTeacher || blocks.length === 0) return;

    const autoSaveInterval = setInterval(() => {
      console.log('Auto-saving blocks...');
      // Since blocks are already saved when added/modified, we just log for now
      // In the future, we could implement bulk update if needed
      toast({
        title: 'Auto-saved',
        description: 'Your assignment changes have been saved.',
      });
    }, 600000); // 10 minutes

    return () => clearInterval(autoSaveInterval);
  }, [isTeacher, blocks.length]);

  // Real-time updates for students - check for block changes every 30 seconds
  useEffect(() => {
    if (isTeacher) return; // Teachers don't need real-time updates

    const checkForUpdates = async () => {
      try {
        const blocksResponse = await fetch(
          `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments/${assignmentId}/blocks`
        );
        if (blocksResponse.ok) {
          const latestBlocks = await blocksResponse.json();
          const sortedLatestBlocks = latestBlocks.sort((a: Block, b: Block) => a.position - b.position);

          // Check if blocks have changed
          const currentBlockIds = blocks.map(b => b.id).sort();
          const latestBlockIds = sortedLatestBlocks.map((b: Block) => b.id).sort();

          const blocksChanged = JSON.stringify(currentBlockIds) !== JSON.stringify(latestBlockIds) ||
                                blocks.some((block, index) => {
                                  const latestBlock = sortedLatestBlocks[index];
                                  return latestBlock && JSON.stringify(block.data) !== JSON.stringify(latestBlock.data);
                                });

          if (blocksChanged) {
            console.log('Blocks updated by teacher, refreshing...');
            setBlocks(sortedLatestBlocks);
            toast({
              title: 'Assignment Updated',
              description: 'The teacher has made changes to this assignment.',
            });
          }
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    const updateInterval = setInterval(checkForUpdates, 30000); // Check every 30 seconds

    return () => clearInterval(updateInterval);
  }, [isTeacher, subjectId, chapterId, paragraphId, assignmentId, blocks]);

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
    console.log('handleAddBlock called with:', { blockType, assignmentId, subjectId, chapterId, paragraphId });

    if (!assignment) {
      console.error('No assignment loaded');
      toast({
        title: 'Error',
        description: 'No assignment loaded.',
        variant: 'destructive'
      });
      return;
    }

    console.log(`Adding block of type: ${blockType}`);

    try {
      // Get the next position
      const maxPosition = blocks.length > 0 ? Math.max(...blocks.map(b => b.position)) : 0;
      const nextPosition = maxPosition + 1;
      console.log(`Next position: ${nextPosition}`);

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
          console.error(`Unknown block type: ${blockType}`);
          return;
      }

      console.log('Block data:', { type: blockType, position: nextPosition, data: defaultData });

      const apiUrl = `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments/${assignmentId}/blocks`;
      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: blockType,
          position: nextPosition,
          data: defaultData
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const newBlock = await response.json();
        console.log('New block created:', newBlock);
        setBlocks(prev => [...prev, newBlock].sort((a, b) => a.position - b.position));
        toast({
          title: 'Block Added',
          description: `${blockType.replace('_', ' ')} block has been added to the assignment.`,
        });
      } else {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error adding block:', error);
      toast({
        title: 'Error',
        description: `Failed to add ${blockType.replace('_', ' ')} block. ${error instanceof Error ? error.message : 'Unknown error'}`,
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

  const handleBlockUpdate = async (blockId: string, newData: any) => {
    if (!assignment) return;

    console.log(`Updating block ${blockId} with data:`, newData);

    try {
      const response = await fetch(
        `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments/${assignmentId}/blocks/${blockId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: newData })
        }
      );

      if (response.ok) {
        const updatedBlock = await response.json();
        console.log('Block updated:', updatedBlock);

        // Update local state
        setBlocks(prev => prev.map(block =>
          block.id === blockId
            ? { ...block, data: { ...block.data, ...newData } }
            : block
        ));

        // Mark as changed for auto-save tracking
        setLastBlockChange(Date.now());
      } else {
        const errorText = await response.text();
        console.error('Block update failed:', errorText);
        throw new Error(`Update failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating block:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive'
      });
      throw error; // Re-throw to let component handle it
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
      onBlockUpdate: handleBlockUpdate,
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
          <Card
            className="p-12 text-center border-dashed"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No content yet</h3>
            <p className="text-muted-foreground">
              {isTeacher
                ? "Drag blocks from below or click to add content to this assignment."
                : "This assignment has no content yet."
              }
            </p>
          </Card>
        ) : (
          <div
            className="space-y-6"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {blocks.map(renderBlock)}
          </div>
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
            {/* Block Template Palette - Drag and Drop */}
            <div>
              <h4 className="text-sm font-medium mb-3">Drag blocks to add them to your assignment:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'text')}
                  className="p-3 border rounded-lg cursor-grab hover:bg-accent transition-colors"
                >
                  📝 Text Block
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'multiple_choice')}
                  className="p-3 border rounded-lg cursor-grab hover:bg-accent transition-colors"
                >
                  ✅ Multiple Choice
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'open_question')}
                  className="p-3 border rounded-lg cursor-grab hover:bg-accent transition-colors"
                >
                  ❓ Open Question
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'image')}
                  className="p-3 border rounded-lg cursor-grab hover:bg-accent transition-colors"
                >
                  🖼️ Image Block
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'video')}
                  className="p-3 border rounded-lg cursor-grab hover:bg-accent transition-colors"
                >
                  🎥 Video Block
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'divider')}
                  className="p-3 border rounded-lg cursor-grab hover:bg-accent transition-colors"
                >
                  ― Divider
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowStudentView(!showStudentView)}>
                👁️ {showStudentView ? 'Teacher View' : 'Student View'}
              </Button>
              <Button variant="outline">Edit Assignment</Button>
              <Button variant="outline">View Submissions</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}