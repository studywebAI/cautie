'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Edit, Save, X, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GradeDisplayProps {
  blockId: string;
  studentId: string;
  studentAnswer?: {
    id: string;
    answer_data: any;
    is_correct: boolean;
    score: number;
    feedback?: string;
    graded_by_ai: boolean;
    submitted_at: string;
  };
  questionData: any;
  isTeacher: boolean;
  onGradeUpdate?: () => void;
}

export function GradeDisplay({
  blockId,
  studentId,
  studentAnswer,
  questionData,
  isTeacher,
  onGradeUpdate
}: GradeDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScore, setEditedScore] = useState(studentAnswer?.score || 0);
  const [editedFeedback, setEditedFeedback] = useState(studentAnswer?.feedback || '');
  const [editedIsCorrect, setEditedIsCorrect] = useState(studentAnswer?.is_correct || false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmitAnswer = async (answer: string) => {
    try {
      const response = await fetch('/api/ai/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockId,
          studentAnswer: answer,
          questionData
        })
      });

      if (response.ok) {
        toast({
          title: 'Answer submitted',
          description: 'Your answer has been graded by AI.'
        });
        onGradeUpdate?.();
      } else {
        throw new Error('Failed to submit answer');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit answer. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleTeacherOverride = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/ai/grade', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockId,
          studentId,
          score: editedScore,
          feedback: editedFeedback,
          isCorrect: editedIsCorrect
        })
      });

      if (response.ok) {
        toast({
          title: 'Grade updated',
          description: 'The grade has been updated successfully.'
        });
        setIsEditing(false);
        onGradeUpdate?.();
      } else {
        throw new Error('Failed to update grade');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update grade. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!studentAnswer) {
    // Student hasn't answered yet - show submit form
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI-Graded Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StudentAnswerForm
            questionData={questionData}
            onSubmit={handleSubmitAnswer}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {studentAnswer.graded_by_ai ? (
              <Bot className="w-5 h-5" />
            ) : (
              <User className="w-5 h-5" />
            )}
            <span>
              {studentAnswer.graded_by_ai ? 'AI-Graded' : 'Teacher-Graded'}
            </span>
          </div>

          {isTeacher && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Override
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Student Answer */}
        <div>
          <Label className="text-sm font-medium">Student Answer</Label>
          <div className="mt-1 p-3 bg-muted rounded-md">
            {typeof studentAnswer.answer_data === 'string'
              ? studentAnswer.answer_data
              : JSON.stringify(studentAnswer.answer_data, null, 2)
            }
          </div>
        </div>

        {/* Grade Display */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {studentAnswer.is_correct ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <Badge variant={studentAnswer.is_correct ? "default" : "destructive"}>
              {studentAnswer.is_correct ? 'Correct' : 'Incorrect'}
            </Badge>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Score:</span>
              <span className="text-lg font-bold">{studentAnswer.score}/100</span>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {studentAnswer.feedback && (
          <div>
            <Label className="text-sm font-medium">Feedback</Label>
            <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              {studentAnswer.feedback}
            </div>
          </div>
        )}

        {/* Teacher Override Dialog */}
        {isTeacher && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Override Grade</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="score">Score (0-100)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    value={editedScore}
                    onChange={(e) => setEditedScore(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    value={editedFeedback}
                    onChange={(e) => setEditedFeedback(e.target.value)}
                    placeholder="Provide feedback for the student..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-correct"
                    checked={editedIsCorrect}
                    onChange={(e) => setEditedIsCorrect(e.target.checked)}
                  />
                  <Label htmlFor="is-correct">Mark as correct</Label>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleTeacherOverride} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

// Student Answer Form Component
function StudentAnswerForm({
  questionData,
  onSubmit
}: {
  questionData: any;
  onSubmit: (answer: string) => Promise<void>;
}) {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(answer.trim());
      setAnswer('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Question</Label>
        <div className="mt-1 p-3 bg-muted rounded-md">
          {questionData.question || questionData.text || 'Question not provided'}
        </div>
      </div>

      <div>
        <Label htmlFor="answer">Your Answer</Label>
        <Textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={4}
          required
        />
      </div>

      <Button type="submit" disabled={submitting || !answer.trim()}>
        {submitting ? 'Submitting...' : 'Submit Answer'}
      </Button>
    </form>
  );
}