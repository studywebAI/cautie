'use client';

import React, { useState } from 'react';
import { BaseBlock, OpenQuestionContent } from './types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface StudentOpenQuestionBlockProps {
  block: BaseBlock & { content: OpenQuestionContent };
  onSubmit: (answerData: any) => void;
}

export const StudentOpenQuestionBlock: React.FC<StudentOpenQuestionBlockProps> = ({
  block,
  onSubmit,
}) => {
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    const answerData = {
      text: answer,
      ai_grading: block.content.ai_grading,
    };
    onSubmit(answerData);
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-4">
      <div className="font-medium">{block.content.question}</div>

      {block.content.ai_grading && (
        <div className="text-sm text-muted-foreground">
          This question will be graded automatically using AI.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="answer">Your Answer</Label>
        <Textarea
          id="answer"
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isSubmitted}
          rows={6}
          maxLength={block.content.max_score ? undefined : 1000}
        />
        <div className="text-sm text-muted-foreground">
          {answer.length} characters
        </div>
      </div>

      {!isSubmitted && (
        <Button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="mt-4"
        >
          Submit Answer
        </Button>
      )}

      {isSubmitted && (
        <div className="text-sm text-green-600 font-medium">
          Answer submitted successfully! {block.content.ai_grading ? 'AI grading in progress...' : ''}
        </div>
      )}
    </div>
  );
};