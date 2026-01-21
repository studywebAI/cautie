'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppContext } from '@/contexts/app-context';
import { useContext } from 'react';
import Link from 'next/link';
import { BlockRenderer } from '@/components/blocks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [isCreateBlockOpen, setIsCreateBlockOpen] = useState(false);
  const [newBlockType, setNewBlockType] = useState('');
  const [newBlockData, setNewBlockData] = useState<any>({});
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
        {blocks.length === 0 && isTeacher && (
          <Card className="p-12 text-center">
            <Edit className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No blocks yet</h3>
            <p className="text-muted-foreground mb-4">
              Add blocks to create content for this assignment.
            </p>
            <Button onClick={() => setIsCreateBlockOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Block
            </Button>
          </Card>
        )}

        {blocks.map((block, index) => (
          <Card key={block.id}>
            <CardContent className="p-6">
              <BlockRenderer
                block={block as any}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Block Button for Teachers */}
      {isTeacher && blocks.length > 0 && (
        <div className="flex justify-center pt-6">
          <Button onClick={() => setIsCreateBlockOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Block
          </Button>
        </div>
      )}

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

      {/* Create Block Dialog */}
      <Dialog open={isCreateBlockOpen} onOpenChange={setIsCreateBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Block to Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="block-type">Block Type</Label>
              <Select value={newBlockType} onValueChange={setNewBlockType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select block type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Block</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="open_question">Open Question</SelectItem>
                  <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
                  <SelectItem value="drag_drop">Drag and Drop</SelectItem>
                  <SelectItem value="ordering">Ordering</SelectItem>
                  <SelectItem value="media_embed">Media Embed</SelectItem>
                  <SelectItem value="divider">Divider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newBlockType === 'text' && (
              <div>
                <Label htmlFor="text-content">Content</Label>
                <textarea
                  id="text-content"
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Enter text content..."
                  value={newBlockData.content || ''}
                  onChange={(e) => setNewBlockData({ ...newBlockData, content: e.target.value })}
                />
              </div>
            )}

            {newBlockType === 'open_question' && (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    placeholder="Enter your question..."
                    value={newBlockData.question || ''}
                    onChange={(e) => setNewBlockData({ ...newBlockData, question: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="criteria">Grading Criteria</Label>
                  <Input
                    id="criteria"
                    placeholder="e.g., grammar, completeness, accuracy"
                    value={newBlockData.grading_criteria || ''}
                    onChange={(e) => setNewBlockData({ ...newBlockData, grading_criteria: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="max-score">Max Score</Label>
                  <Input
                    id="max-score"
                    type="number"
                    min="1"
                    value={newBlockData.max_score || 5}
                    onChange={(e) => setNewBlockData({ ...newBlockData, max_score: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {/* Add similar fields for other block types as needed */}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateBlockOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!newBlockType) return;

                try {
                  const response = await fetch(
                    `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments/${assignmentId}/blocks`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: newBlockType,
                        position: blocks.length,
                        data: newBlockData
                      })
                    }
                  );

                  if (response.ok) {
                    const newBlock = await response.json();
                    setBlocks(prev => [...prev, newBlock]);
                    setIsCreateBlockOpen(false);
                    setNewBlockType('');
                    setNewBlockData({});
                    toast({
                      title: 'Block Added',
                      description: 'The block has been added to the assignment.',
                    });
                  } else {
                    throw new Error('Failed to create block');
                  }
                } catch (error) {
                  toast({
                    title: 'Error',
                    description: 'Failed to add block.',
                    variant: 'destructive'
                  });
                }
              }}
              disabled={!newBlockType}
            >
              Add Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}