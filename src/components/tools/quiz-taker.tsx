'use client';

import React, { useState, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { explainAnswer } from '@/ai/flows/explain-answer';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, RefreshCw, ArrowRight, Lightbulb } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Quiz, QuizQuestion, QuizOption } from '@/ai/flows/generate-quiz';
import { AnimatePresence, motion } from 'framer-motion';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { playCorrectSound, playIncorrectSound } from '@/lib/audio';

type AnswersState = { [questionId: string]: string };
export type QuizMode = "normal" | "practice" | "exam";

const modeDetails: Record<QuizMode, { title: string; description: string }> = {
    normal: {
        title: "Quiz",
        description: "Answer the questions to the best of your ability."
    },
    practice: {
        title: "Practice Mode",
        description: "Learn as you go with immediate feedback and explanations."
    },
    exam: {
        title: "Exam Simulation",
        description: "This is a timed test. No hints are allowed. Good luck."
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

function PracticeModeTaker({ quiz, onRestart }: { quiz: Quiz, onRestart: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [answers, setAnswers] = useState<AnswersState>({});
    const { soundEnabled } = useContext(AppContext) as AppContextType;

    const question = quiz.questions[currentIndex];
    const correctOption = question.options.find(o => o.isCorrect);

    const { toast } = useToast();

    const handleCheckAnswer = async () => {
        if (!selectedOptionId || !correctOption) return;
        
        const isAnswerCorrect = selectedOptionId === correctOption.id;
        setIsCorrect(isAnswerCorrect);
        setIsAnswered(true);
        setAnswers(prev => ({...prev, [question.id]: selectedOptionId}));

        if (isAnswerCorrect) {
            if (soundEnabled) playCorrectSound();
        } else {
             if (soundEnabled) playIncorrectSound();
            setIsExplanationLoading(true);
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
    }

    const handleNextQuestion = () => {
        if (currentIndex < quiz.questions.length) {
            setIsAnswered(false);
            setSelectedOptionId(null);
            setExplanation(null);
            setIsCorrect(false);
            setCurrentIndex(prev => prev + 1);
        }
    }
    
    if (currentIndex >= quiz.questions.length) {
        return <FinalResults quiz={quiz} answers={answers} onRestart={onRestart} />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{modeDetails.practice.title}: {quiz.title}</CardTitle>
                <CardDescription>{modeDetails.practice.description} Progress: {currentIndex} / {quiz.questions.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="font-semibold mb-4 text-lg">{currentIndex + 1}. {question.question}</p>
                        <RadioGroup onValueChange={setSelectedOptionId} value={selectedOptionId || ''} disabled={isAnswered}>
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
                                                isAnswered && isTheCorrectAnswer ? 'bg-green-100 dark:bg-green-900/30 border-green-500/50' : '',
                                                isAnswered && isSelected && !isTheCorrectAnswer ? 'bg-red-100 dark:bg-red-900/30 border-red-500/50' : '',
                                                !isAnswered ? 'cursor-pointer hover:bg-muted/80' : 'cursor-default',
                                                isAnswered && !isSelected && !isTheCorrectAnswer ? 'bg-muted/50 opacity-70' : ''
                                            )}
                                        >
                                            <RadioGroupItem value={opt.id} id={`${question.id}-${opt.id}`} className="flex-shrink-0" />
                                            <span>{opt.text}</span>

                                            {isAnswered && isCorrect && isSelected && <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />}
                                            {isAnswered && !isCorrect && isSelected && <XCircle className="h-5 w-5 text-red-600 ml-auto" />}
                                        </Label>
                                    )
                                })}
                            </div>
                        </RadioGroup>

                        {isAnswered && !isCorrect && (isExplanationLoading ? <Loader2 className="mt-4 h-5 w-5 animate-spin" /> :
                            explanation && (
                                <Alert className="mt-4 border-blue-500/50 text-blue-500 dark:text-blue-400 [&>svg]:text-blue-500 dark:[&>svg]:text-blue-400">
                                    <Lightbulb className="h-4 w-4" />
                                    <AlertTitle>Explanation</AlertTitle>
                                    <AlertDescription>
                                        {explanation}
                                    </AlertDescription>
                                </Alert>
                            )
                        )}
                    </motion.div>
                </AnimatePresence>
            </CardContent>
            <CardFooter className="flex justify-between">
                <div>
                   {isAnswered && isCorrect && <div className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /><span>Correct!</span></div>}
                   {isAnswered && !isCorrect && <div className="flex items-center gap-2 text-red-600"><XCircle className="h-5 w-5" /><span>Incorrect</span></div>}
                </div>
                {!isAnswered ?
                    <Button onClick={handleCheckAnswer} disabled={!selectedOptionId}>Check Answer</Button> :
                    <Button onClick={handleNextQuestion}>
                        {currentIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                }
            </CardFooter>
        </Card>
    )
}

function NormalExamTaker({ quiz, mode, onRestart }: { quiz: Quiz; mode: QuizMode, onRestart: () => void; }) {
    const [answers, setAnswers] = useState<AnswersState>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleAnswerChange = (questionId: string, optionId: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return <FinalResults quiz={quiz} answers={answers} onRestart={onRestart} />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{modeDetails[mode].title}: {quiz.title}</CardTitle>
                <CardDescription>{modeDetails[mode].description}</CardDescription>
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


export function QuizTaker({ quiz, mode, onRestart }: { quiz: Quiz; mode: QuizMode; onRestart: () => void; }) {
    if (mode === 'practice') {
        return <PracticeModeTaker quiz={quiz} onRestart={onRestart} />;
    }
    return <NormalExamTaker quiz={quiz} mode={mode} onRestart={onRestart} />;
}
