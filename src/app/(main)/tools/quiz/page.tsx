'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateQuiz, Quiz } from '@/ai/flows/generate-quiz';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QuizTaker, QuizMode } from '@/components/tools/quiz-taker';

function QuizPageContent() {
  const searchParams = useSearchParams();
  const sourceTextFromParams = searchParams.get('sourceText');
  
  const [sourceText, setSourceText] = useState(sourceTextFromParams || '');
  const [isLoading, setIsLoading] = useState(!!sourceTextFromParams);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>('practice');
  const { toast } = useToast();

  const handleGenerate = useCallback(async (text: string) => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Source text is empty',
        description: 'Please paste some text to generate a quiz from.',
      });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setGeneratedQuiz(null);
    try {
      const questionCount = quizMode === 'survival' || quizMode === 'adaptive' || quizMode === 'endless' ? 1 : 7;
      const response = await generateQuiz({ sourceText: text, questionCount });
      setGeneratedQuiz(response);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'The AI could not generate a quiz. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, quizMode]);

  useEffect(() => {
    if (sourceTextFromParams) {
      handleGenerate(sourceTextFromParams);
    }
  }, [sourceTextFromParams, handleGenerate]);

  const handleFormSubmit = () => {
    handleGenerate(sourceText);
  }
  
  if (isLoading) {
    return (
       <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
        <div className="flex flex-col items-center gap-2 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h3 className="text-2xl font-bold tracking-tight mt-4">
                Generating Your Quiz
            </h3>
            <p className="text-sm text-muted-foreground">
                The AI is working its magic. Please wait a moment...
            </p>
        </div>
      </div>
    )
  }

  if (generatedQuiz) {
    return <QuizTaker quiz={generatedQuiz} mode={quizMode} sourceText={sourceText} onRestart={() => setGeneratedQuiz(null)} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">AI Quiz Generator</h1>
        <p className="text-muted-foreground">
          Paste any text to automatically generate a multiple-choice quiz.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Create a Quiz</CardTitle>
          <CardDescription>
            Provide the source material and choose a mode for your quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your notes, a book chapter, or any article here..."
            className="h-48 resize-none"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />
           <div className="space-y-2">
              <Label htmlFor="quiz-mode">Quiz Mode</Label>
              <Select value={quizMode} onValueChange={(value) => setQuizMode(value as QuizMode)}>
                <SelectTrigger id="quiz-mode" className="w-[280px]">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practice">Practice Mode</SelectItem>
                  <SelectItem value="normal">Normal Mode</SelectItem>
                  <SelectItem value="exam">Exam Mode</SelectItem>
                  <SelectItem value="survival">Survival Mode</SelectItem>
                  <SelectItem value="speedrun">Speedrun Mode</SelectItem>
                  <SelectItem value="adaptive">Adaptive Mode</SelectItem>
                  <SelectItem value="endless">Endless Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleFormSubmit} disabled={isLoading || !sourceText}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading ? 'Generating...' : 'Generate with AI'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function QuizPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QuizPageContent />
        </Suspense>
    )
}
