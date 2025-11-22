'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateQuiz, Quiz, QuizQuestion } from '@/ai/flows/generate-quiz';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type AnswersState = { [questionId: string]: string };

function QuizTaker({ quiz, onRestart }: { quiz: Quiz; onRestart: () => void; }) {
  const [answers, setAnswers] = useState<AnswersState>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };
  
  const getCorrectCount = () => {
      return quiz.questions.filter(q => {
          const selectedOptionId = answers[q.id];
          const correctOption = q.options.find(opt => opt.isCorrect);
          return correctOption?.id === selectedOptionId;
      }).length;
  }
  
  if (isSubmitted) {
     return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Quiz Results</CardTitle>
                <CardDescription>You scored {getCorrectCount()} out of {quiz.questions.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {quiz.questions.map((q, index) => {
                   const selectedOptionId = answers[q.id];
                   const correctOption = q.options.find(opt => opt.isCorrect);
                   const isCorrect = correctOption?.id === selectedOptionId;

                   return (
                     <div key={q.id}>
                       <h3 className="font-semibold mb-2">{index + 1}. {q.question}</h3>
                       <div className="space-y-2">
                           {q.options.map(opt => {
                                const isSelected = selectedOptionId === opt.id;
                                const isTheCorrectAnswer = correctOption?.id === opt.id;

                                return (
                                    <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-md text-sm
                                        ${isTheCorrectAnswer ? 'bg-green-100 dark:bg-green-900/30 border-green-500/50' : ''}
                                        ${isSelected && !isTheCorrectAnswer ? 'bg-red-100 dark:bg-red-900/30 border-red-500/50' : ''}
                                        ${!isSelected && !isTheCorrectAnswer ? 'bg-muted/50' : ''}
                                    `}>
                                        { isSelected && isCorrect && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" /> }
                                        { isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" /> }
                                        { !isSelected && isTheCorrectAnswer && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" /> }
                                        { !isSelected && !isTheCorrectAnswer && <div className="h-5 w-5 flex-shrink-0" /> }
                                        <span>{opt.text}</span>
                                    </div>
                                )
                           })}
                       </div>
                     </div>
                   )
               })}
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={onRestart}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Take Another Quiz
                </Button>
            </CardFooter>
        </Card>
     )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{quiz.title}</CardTitle>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {quiz.questions.map((q, index) => (
          <div key={q.id}>
            <p className="font-semibold mb-4">{index + 1}. {q.question}</p>
            <RadioGroup onValueChange={(value) => handleAnswerChange(q.id, value)}>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <div key={opt.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.id} id={`${q.id}-${opt.id}`} />
                    <Label htmlFor={`${q.id}-${opt.id}`}>{opt.text}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== quiz.questions.length}>
          Submit Quiz
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function QuizPage() {
  const [sourceText, setSourceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!sourceText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Source text is empty',
        description: 'Please paste some text to generate a quiz from.',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedQuiz(null);
    try {
      const response = await generateQuiz({ sourceText });
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
  };
  
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
    return <QuizTaker quiz={generatedQuiz} onRestart={() => setGeneratedQuiz(null)} />;
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
            Provide the source material for your quiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your notes, a book chapter, or any article here..."
            className="h-48 resize-none"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isLoading}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
