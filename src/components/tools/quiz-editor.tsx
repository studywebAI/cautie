'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, PlusCircle, ArrowLeft, Play, Undo2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnimatePresence, motion } from 'framer-motion';
import { generateSingleQuestion } from '@/ai/flows/generate-single-question';
import type { Quiz, QuizQuestion } from '@/lib/types';

type QuizEditorProps = {
  quiz: Quiz;
  sourceText: string;
  onStartQuiz: (finalQuiz: Quiz) => void;
  onBack: () => void;
};

export function QuizEditor({ quiz, sourceText, onStartQuiz, onBack }: QuizEditorProps) {
  const [currentQuiz, setCurrentQuiz] = useState<Quiz>(quiz);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<{ question: QuizQuestion; index: number } | null>(null);
  const { toast } = useToast();

  const handleAddQuestion = async () => {
    setIsAddingQuestion(true);
    try {
      const newQuestion = await generateSingleQuestion({
        sourceText: sourceText,
        difficulty: 5, // Default to medium difficulty for added questions
        existingQuestionIds: currentQuiz.questions.map(q => q.id),
      });
      setCurrentQuiz(prevQuiz => ({
        ...prevQuiz,
        questions: [...prevQuiz.questions, newQuestion],
      }));
    } catch (error) {
      console.error("Failed to add question:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to Add Question',
        description: 'The AI could not generate a new question. Please try again.',
      });
    } finally {
      setIsAddingQuestion(false);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    const questionIndex = currentQuiz.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) return;

    const questionToDelete = currentQuiz.questions[questionIndex];
    setLastDeleted({ question: questionToDelete, index: questionIndex });

    const newQuestions = currentQuiz.questions.filter(q => q.id !== questionId);
    setCurrentQuiz(prevQuiz => ({
      ...prevQuiz,
      questions: newQuestions,
    }));
    
    toast({
      title: 'Question Deleted',
      action: (
        <Button variant="secondary" size="sm" onClick={() => handleUndoDelete()}>
          <Undo2 className="mr-2 h-4 w-4" />
          Undo
        </Button>
      ),
    });
  };

  const handleUndoDelete = () => {
    if (!lastDeleted) return;

    const newQuestions = [...currentQuiz.questions];
    newQuestions.splice(lastDeleted.index, 0, lastDeleted.question);
    setCurrentQuiz(prevQuiz => ({
      ...prevQuiz,
      questions: newQuestions,
    }));
    setLastDeleted(null);
  };


  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-2xl">Review & Edit Quiz</CardTitle>
            <CardDescription>Add, remove, or reorder questions before you start.</CardDescription>
          </div>
           <Button onClick={handleAddQuestion} disabled={isAddingQuestion}>
            {isAddingQuestion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentQuiz.questions.length === 0 ? (
          <Alert>
            <AlertTitle>Empty Quiz</AlertTitle>
            <AlertDescription>
              There are no questions in this quiz. Add some questions to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <AnimatePresence>
            {currentQuiz.questions.map((q, index) => (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="p-4 border rounded-lg bg-muted/50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold">{index + 1}. {q.question}</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-5">
                      {q.options.map(opt => (
                        <li key={opt.id} className={opt.isCorrect ? 'font-medium text-primary' : ''}>
                          {opt.text} {opt.isCorrect && '(Correct)'}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteQuestion(q.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Setup
        </Button>
        <Button onClick={() => onStartQuiz(currentQuiz)} disabled={currentQuiz.questions.length === 0}>
          <Play className="mr-2 h-4 w-4" />
          Start Quiz ({currentQuiz.questions.length} questions)
        </Button>
      </CardFooter>
    </Card>
  );
}
