'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { explainAnswer } from '@/ai/flows/explain-answer';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, RefreshCw, ArrowRight, Lightbulb, Timer } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Quiz, QuizQuestion, QuizOption } from '@/ai/flows/generate-quiz';
import { AnimatePresence, motion } from 'framer-motion';

type AnswersState = { [questionId: string]: string };
export type QuizMode = "normal" | "practice" | "exam";

const modeDetails: Record<QuizMode, { title: string; description: string }> = {
    normal: {
        title: "Quiz",
        description: "Answer all questions and submit at the end."
    },
    practice: {
        title: "Practice Mode",
        description: "Learn as you go with immediate feedback and explanations."
    },
    exam: {
        title: "Exam Simulation",
        description: "This is a timed test. No hints or going back. Good luck."
    }
}

function FinalResults({ quiz, answers, onRestart }: { quiz: Quiz, answers: AnswersState, onRestart: () => void }) {
    const getCorrectCount = () => {
        return quiz.questions.filter(q => {
            const selectedOptionId = answers[q.id];
            const correctOption = q.options.find(opt => opt.isCorrect);
            return correctOption?.id === selectedOptionId;
        }).length;
    }

    const correctCount = getCorrectCount();
    const totalQuestions = quiz.questions.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Quiz Results</CardTitle>
                <CardDescription>You scored {correctCount} out of {totalQuestions} ({scorePercentage}%)</CardDescription>
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
                                        <div key={opt.id} className={cn(`flex items-center gap-3 p-3 rounded-md text-sm border`,
                                            isTheCorrectAnswer ? 'bg-green-100 dark:bg-green-900/30 border-green-500/50' : '',
                                            isSelected && !isTheCorrectAnswer ? 'bg-red-100 dark:bg-red-900/30 border-red-500/50' : '',
                                            !isSelected && !isTheCorrectAnswer ? 'bg-muted/50' : ''
                                        )}>
                                            {isCorrect && isSelected && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />}
                                            {!isCorrect && isSelected && <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
                                            {isTheCorrectAnswer && !isSelected && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />}
                                            {!isTheCorrectAnswer && !isSelected && <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/50 flex-shrink-0" />}
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

function Question({ question, onAnswer, disabled, selectedOptionId }: { question: QuizQuestion, onAnswer: (optionId: string) => void, disabled: boolean, selectedOptionId: string | null }) {
    const correctOption = question.options.find(o => o.isCorrect);
    
    return (
        <div>
            <p className="font-semibold mb-4 text-lg">{question.question}</p>
            <RadioGroup onValueChange={onAnswer} value={selectedOptionId || ''} disabled={disabled}>
                <div className="space-y-3">
                    {question.options.map((opt) => {
                         const isTheCorrectAnswer = correctOption?.id === opt.id;
                         const isSelected = selectedOptionId === opt.id;

                        return (
                            <Label
                                key={opt.id}
                                htmlFor={`${question.id}-${opt.id}`}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-md text-sm border transition-all',
                                    disabled && isTheCorrectAnswer ? 'bg-green-100 dark:bg-green-900/30 border-green-500/50' : '',
                                    disabled && isSelected && !isTheCorrectAnswer ? 'bg-red-100 dark:bg-red-900/30 border-red-500/50' : '',
                                    !disabled ? 'cursor-pointer hover:bg-muted/80' : 'cursor-default',
                                    disabled && !isSelected && !isTheCorrectAnswer ? 'bg-muted/50 opacity-70' : ''
                                )}
                            >
                                <RadioGroupItem value={opt.id} id={`${question.id}-${opt.id}`} className="flex-shrink-0" />
                                <span>{opt.text}</span>

                                {disabled && (selectedOptionId === opt.id) && (isTheCorrectAnswer ? <CheckCircle className="h-5 w-5 text-green-600 ml-auto" /> : <XCircle className="h-5 w-5 text-red-600 ml-auto" />) }
                            </Label>
                        )
                    })}
                </div>
            </RadioGroup>
        </div>
    )
}


export function QuizTaker({ quiz, mode, onRestart }: { quiz: Quiz; mode: QuizMode; onRestart: () => void; }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswersState>({});
    const [isFinished, setIsFinished] = useState(false);
    
    // Practice mode state
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    
    // Exam mode state
    const timePerQuestion = 30; // 30 seconds per question
    const totalTime = quiz.questions.length * timePerQuestion;
    const [timeLeft, setTimeLeft] = useState(totalTime);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { toast } = useToast();
    const question = quiz.questions[currentIndex];

    useEffect(() => {
        if (mode === 'exam' && !isFinished) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current!);
                        handleFinishQuiz();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, isFinished]);


    const handleAnswerChange = (questionId: string, optionId: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    };
    
    const handleFinishQuiz = () => {
        setIsFinished(true);
    };

    // --- Practice Mode Handlers ---
    const handleCheckAnswer = async () => {
        const selectedOptionId = answers[question.id];
        if (!selectedOptionId) return;
        
        const correctOption = question.options.find(o => o.isCorrect);
        const isAnswerCorrect = selectedOptionId === correctOption?.id;
        
        setIsCorrect(isAnswerCorrect);
        setIsAnswered(true);
    }
    
    const handleGetExplanation = async () => {
        const selectedOptionId = answers[question.id];
        const correctOption = question.options.find(o => o.isCorrect);
        if (!selectedOptionId || !correctOption) return;
        
        setIsExplanationLoading(true);
        setExplanation(null);
        try {
            const selectedAnswer = question.options.find(o => o.id === selectedOptionId)?.text || '';
            const result = await explainAnswer({
                question: question.question,
                selectedAnswer: selectedAnswer,
                correctAnswer: correctOption.text,
                isCorrect: false,
            });
            setExplanation(result.explanation);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Could not get explanation',
                description: 'The AI failed to generate an explanation. Please try again.',
            })
        } finally {
            setIsExplanationLoading(false);
        }
    }

    const handleNextQuestion = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < quiz.questions.length) {
            setCurrentIndex(nextIndex);
            setIsAnswered(false);
            setIsCorrect(false);
            setExplanation(null);
        } else {
            handleFinishQuiz();
        }
    }
    
    if (isFinished) {
        return <FinalResults quiz={quiz} answers={answers} onRestart={onRestart} />
    }
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline">{modeDetails[mode].title}: {quiz.title}</CardTitle>
                        <CardDescription>{modeDetails[mode].description}</CardDescription>
                    </div>
                    {mode === 'exam' && (
                        <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                            <Timer className="h-5 w-5" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>
                 <p className="text-sm font-medium text-muted-foreground pt-2">
                    Progress: {mode === 'normal' ? Object.keys(answers).length : currentIndex + 1} / {quiz.questions.length}
                </p>
            </CardHeader>
            <CardContent className="space-y-8 overflow-hidden min-h-[20rem]">
                {mode === 'normal' ? (
                     quiz.questions.map((q, index) => (
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
                    ))
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Question
                                question={question}
                                onAnswer={(optionId) => handleAnswerChange(question.id, optionId)}
                                disabled={isAnswered}
                                selectedOptionId={answers[question.id] || null}
                            />
                             {isAnswered && !isCorrect && (
                                <div className="mt-4 space-y-4">
                                    <Button variant="outline" size="sm" onClick={handleGetExplanation} disabled={isExplanationLoading}>
                                        {isExplanationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                                        {isExplanationLoading ? 'Generating...' : 'Explain it to me'}
                                    </Button>
                                    {explanation && (
                                        <Alert className="border-blue-500/50 text-blue-500 dark:text-blue-400 [&>svg]:text-blue-500 dark:[&>svg]:text-blue-400">
                                            <Lightbulb className="h-4 w-4" />
                                            <AlertTitle>Explanation</AlertTitle>
                                            <AlertDescription>
                                                {explanation}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <div>
                   {mode === 'practice' && isAnswered && isCorrect && <div className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /><span>Correct!</span></div>}
                   {mode === 'practice' && isAnswered && !isCorrect && <div className="flex items-center gap-2 text-red-600"><XCircle className="h-5 w-5" /><span>Incorrect</span></div>}
                </div>
                {mode === 'practice' && (
                     !isAnswered ?
                    <Button onClick={handleCheckAnswer} disabled={!answers[question.id]}>Check Answer</Button> :
                    <Button onClick={handleNextQuestion}>
                        {currentIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
                 {mode === 'exam' && (
                     <Button onClick={handleNextQuestion} disabled={!answers[question.id]}>
                        {currentIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
                {mode === 'normal' && (
                    <Button onClick={handleFinishQuiz} disabled={Object.keys(answers).length !== quiz.questions.length}>
                        Submit Quiz
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
