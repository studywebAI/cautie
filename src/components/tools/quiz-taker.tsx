'use client';

import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { explainAnswer } from '@/ai/flows/explain-answer';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { generateSingleQuestion } from '@/ai/flows/generate-single-question';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, RefreshCw, ArrowRight, Lightbulb, Timer, ShieldAlert, Trophy, Zap, Bomb, TrendingUp, BookOpen, Clock, Target } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Quiz, QuizQuestion, QuizOption } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Pie, PieChart } from 'recharts';
import { SessionRecapData } from '@/lib/types';

type AnswersState = { [questionId: string]: string };
export type QuizMode = "normal" | "practice" | "exam" | "survival" | "speedrun" | "adaptive";

const SURVIVAL_PENALTY_COUNT = 3;
const ADAPTIVE_QUESTION_COUNT = 10;

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
    },
    survival: {
        title: "Survival Mode",
        description: `Answer correctly or get more questions. You must clear the queue to win.`
    },
    speedrun: {
        title: "Speedrun Mode",
        description: "Answer as fast as you can. Three strikes and you're out."
    },
    adaptive: {
        title: "Adaptive Mode",
        description: "The question difficulty adapts to your performance."
    }
}

const chartConfig = {
  correct: {
    label: "Correct",
    color: "hsl(var(--chart-2))",
  },
  incorrect: {
    label: "Incorrect",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;


function FinalResults({ quiz, answers, onRestart, mode, timeTaken = 0, setSessionRecap }: { quiz: Quiz, answers: AnswersState, onRestart: () => void, mode: QuizMode, timeTaken?: number, setSessionRecap: (data: SessionRecapData | null) => void }) {
    const correctCount = quiz.questions.filter(q => {
        const selectedOptionId = answers[q.id];
        if (!selectedOptionId) return false;
        const correctOption = q.options.find(opt => opt.isCorrect);
        return correctOption?.id === selectedOptionId;
    }).length;

    const totalQuestions = quiz.questions.length;
    const incorrectCount = totalQuestions - correctCount;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    
    useEffect(() => {
        setSessionRecap({
            score: scorePercentage,
            correctAnswers: correctCount,
            totalQuestions: totalQuestions,
            timeTaken: timeTaken,
        });
        // Clear recap on unmount
        return () => setSessionRecap(null);
    }, [setSessionRecap, scorePercentage, correctCount, totalQuestions, timeTaken]);


    if (mode === 'survival' && correctCount === totalQuestions && Object.keys(answers).length === totalQuestions) {
        return (
             <Card>
                <CardHeader className="items-center text-center">
                    <Trophy className="h-16 w-16 text-yellow-500" />
                    <CardTitle className="font-headline text-3xl mt-4">You Survived!</CardTitle>
                    <CardDescription>You answered all {totalQuestions} questions correctly. Well done.</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                    <Button onClick={onRestart}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Play Again
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    if (mode === 'speedrun') {
        const speedrunScore = Math.max(0, (correctCount * 1000) - (timeTaken * 10));
        return (
             <Card>
                <CardHeader className="items-center text-center">
                    <Zap className="h-16 w-16 text-primary" />
                    <CardTitle className="font-headline text-3xl mt-4">Speedrun Complete!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <div className="text-5xl font-bold font-headline">{speedrunScore.toLocaleString()}</div>
                    <p className="text-muted-foreground">Final Score</p>
                    <div className="grid grid-cols-3 divide-x rounded-lg border bg-muted/50 p-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Correct</p>
                            <p className="text-xl font-semibold">{correctCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Strikes</p>
                            <p className="text-xl font-semibold">{quiz.questions.length - correctCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Time</p>
                            <p className="text-xl font-semibold">{timeTaken}s</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button onClick={onRestart}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    const chartData = [
        { name: 'correct', value: correctCount, fill: 'var(--color-correct)' },
        { name: 'incorrect', value: incorrectCount, fill: 'var(--color-incorrect)' },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Quiz Results</CardTitle>
                <CardDescription>Here's how you did on the "{quiz.title}" quiz.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                     <div className='flex justify-center'>
                         <ChartContainer config={chartConfig} className="h-48 w-48">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Pie 
                                    data={chartData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    innerRadius={50}
                                    strokeWidth={2}
                                />
                            </PieChart>
                        </ChartContainer>
                     </div>
                     <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <Target className="h-7 w-7 text-primary mx-auto mb-2" />
                            <p className="text-2xl font-bold">{scorePercentage}%</p>
                            <p className="text-sm text-muted-foreground">Score</p>
                        </div>
                         <div className="p-4 bg-muted/50 rounded-lg">
                            <Clock className="h-7 w-7 text-primary mx-auto mb-2" />
                            <p className="text-2xl font-bold">{timeTaken}s</p>
                            <p className="text-sm text-muted-foreground">Time Taken</p>
                        </div>
                         <div className="p-4 bg-green-500/10 rounded-lg text-green-700 dark:text-green-400">
                            <CheckCircle className="h-7 w-7 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{correctCount}</p>
                            <p className="text-sm ">Correct</p>
                        </div>
                         <div className="p-4 bg-red-500/10 rounded-lg text-red-700 dark:text-red-500">
                            <XCircle className="h-7 w-7 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{incorrectCount}</p>
                            <p className="text-sm">Incorrect</p>
                        </div>
                     </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><BookOpen className="h-5 w-5" /> Review Your Answers</h3>
                    {quiz.questions.map((q, index) => {
                        const selectedOptionId = answers[q.id];
                        const correctOption = q.options.find(opt => opt.isCorrect);
                        const isCorrect = correctOption?.id === selectedOptionId;

                        return (
                            <div key={q.id} className="p-4 rounded-lg bg-muted/50">
                                <h4 className="font-semibold mb-2">{index + 1}. {q.question}</h4>
                                <div className="space-y-2">
                                    {q.options.map(opt => {
                                        const isSelected = selectedOptionId === opt.id;
                                        const isTheCorrectAnswer = correctOption?.id === opt.id;

                                        return (
                                            <div key={opt.id} className={cn(`flex items-center gap-3 p-2 rounded-md text-sm border`,
                                                isTheCorrectAnswer ? 'bg-green-100 dark:bg-green-900/30 border-green-500/50' : '',
                                                isSelected && !isTheCorrectAnswer ? 'bg-red-100 dark:bg-red-900/30 border-red-500/50' : '',
                                                !isSelected && !isTheCorrectAnswer ? 'bg-background/50' : ''
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
                </div>
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


export function QuizTaker({ quiz, mode, sourceText, onRestart }: { quiz: Quiz; mode: QuizMode; sourceText: string, onRestart: () => void; }) {
    const [answers, setAnswers] = useState<AnswersState>({});
    const [isFinished, setIsFinished] = useState(false);
    const { toast } = useToast();
    const { setSessionRecap } = useContext(AppContext) as AppContextType;


    // Mode-specific state
    const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>(quiz.questions);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [isPenaltyLoading, setIsPenaltyLoading] = useState(false);
    
    // Timer states
    const [examTimeLeft, setExamTimeLeft] = useState(quiz.questions.length * 30);
    const [speedrunTime, setSpeedrunTime] = useState(0);
    const [strikes, setStrikes] = useState(0);
    
    // Adaptive mode states
    const [difficulty, setDifficulty] = useState(5); // Start at medium difficulty
    const [isGeneratingNext, setIsGeneratingNext] = useState(false);


    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const question = currentQuestions[currentIndex];

    const handleFinishQuiz = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsFinished(true);
    }, []);

    useEffect(() => {
        if (mode === 'exam' && !isFinished) {
            timerRef.current = setInterval(() => {
                setExamTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current!);
                        handleFinishQuiz();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else if ((mode === 'speedrun' || mode === 'normal' || mode === 'practice') && !isFinished) {
            timerRef.current = setInterval(() => {
                setSpeedrunTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [mode, isFinished, handleFinishQuiz]);

    const handleAnswerChange = (questionId: string, optionId: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));

        if(mode === 'practice' || mode === 'survival' || mode === 'speedrun' || mode === 'adaptive') {
            const currentQuestion = currentQuestions.find(q => q.id === questionId) || question;
            const correctOption = currentQuestion.options.find(o => o.isCorrect);
            const isAnswerCorrect = optionId === correctOption?.id;
            setIsCorrect(isAnswerCorrect);
            setIsAnswered(true);

            if (mode === 'survival' && !isAnswerCorrect) {
                handleSurvivalPenalty();
            }
            if (mode === 'speedrun' && !isAnswerCorrect) {
                const newStrikes = strikes + 1;
                setStrikes(newStrikes);
                if (newStrikes >= 3) {
                    handleFinishQuiz();
                }
            }
            if (mode === 'adaptive') {
                if (isAnswerCorrect) {
                    setDifficulty(d => Math.min(10, d + 1));
                } else {
                    setDifficulty(d => Math.max(1, d - 1));
                }
            }
        }
    };
        
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
                isCorrect: isCorrect,
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

    const handleSurvivalPenalty = async () => {
        setIsPenaltyLoading(true);
        toast({
            title: 'Incorrect!',
            description: `Penalty! Adding ${SURVIVAL_PENALTY_COUNT} new questions to the queue.`,
            variant: 'destructive',
        });
        try {
            const existingIds = currentQuestions.map(q => q.id);
            const penaltyQuiz = await generateQuiz({
                sourceText,
                questionCount: SURVIVAL_PENALTY_COUNT,
                existingQuestionIds: existingIds
            });
            setCurrentQuestions(prev => [...prev, ...penaltyQuiz.questions]);
        } catch(e) {
             toast({
                variant: 'destructive',
                title: 'Failed to add penalty questions',
                description: 'Please proceed to the next question.',
            })
        } finally {
            setIsPenaltyLoading(false);
        }
    }

    const handleNextQuestion = async () => {
        const nextIndex = currentIndex + 1;

        if (mode === 'adaptive') {
            if (nextIndex >= ADAPTIVE_QUESTION_COUNT) {
                handleFinishQuiz();
                return;
            }
            setIsGeneratingNext(true);
            try {
                const newQuestion = await generateSingleQuestion({
                    sourceText,
                    difficulty,
                    existingQuestionIds: currentQuestions.map(q => q.id),
                });
                setCurrentQuestions(prev => [...prev, newQuestion]);
                setCurrentIndex(nextIndex);
            } catch(e) {
                toast({
                    variant: 'destructive',
                    title: 'Failed to generate next question',
                    description: 'Please try again.',
                });
            } finally {
                setIsGeneratingNext(false);
            }
        } else {
            if (nextIndex < currentQuestions.length) {
                setCurrentIndex(nextIndex);
            } else {
                handleFinishQuiz();
            }
        }
        
        setIsAnswered(false);
        setIsCorrect(false);
        setExplanation(null);
    }
    
    if (isFinished) {
        return <FinalResults quiz={{...quiz, questions: currentQuestions}} answers={answers} onRestart={onRestart} mode={mode} timeTaken={speedrunTime} setSessionRecap={setSessionRecap} />
    }
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    const selectedOptionId = question ? answers[question.id] || null : null;

    const renderHeaderInfo = () => {
        if (mode === 'exam') {
             return (
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <Timer className="h-5 w-5" />
                    <span>{formatTime(examTimeLeft)}</span>
                </div>
            );
        }
        if (mode === 'speedrun') {
            return (
                <div className="flex items-center gap-4 text-lg font-semibold">
                    <div className="flex items-center gap-2 text-primary">
                        <Timer className="h-5 w-5" />
                        <span>{formatTime(speedrunTime)}</span>
                    </div>
                     <div className="flex items-center gap-2 text-destructive">
                        <Bomb className="h-5 w-5" />
                        <span>{strikes} / 3</span>
                    </div>
                </div>
            );
        }
         if (mode === 'adaptive') {
            return (
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <TrendingUp className="h-5 w-5" />
                    <span>Difficulty: {difficulty}</span>
                </div>
            );
        }
        return null;
    }

    const questionCounter = () => {
        if (mode === 'adaptive') return `${currentIndex + 1} / ${ADAPTIVE_QUESTION_COUNT}`;
        if (mode === 'exam' || mode === 'normal') return `${Object.keys(answers).length} / ${currentQuestions.length}`;
        return `${currentIndex + 1} / ${currentQuestions.length}`;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline">{modeDetails[mode].title}: {quiz.title}</CardTitle>
                        <CardDescription>{modeDetails[mode].description}</CardDescription>
                    </div>
                   {renderHeaderInfo()}
                </div>
                 <p className="text-sm font-medium text-muted-foreground pt-2">
                    Question: {questionCounter()}
                </p>
            </CardHeader>
            <CardContent className="space-y-8 overflow-hidden min-h-[20rem]">
                {mode === 'normal' || mode === 'exam' ? (
                     currentQuestions.map((q, index) => (
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
                            {question ? (
                                <>
                                <Question
                                    question={question}
                                    onAnswer={(optionId) => handleAnswerChange(question.id, optionId)}
                                    disabled={(isAnswered && (mode !== 'normal' && mode !== 'exam')) || isGeneratingNext}
                                    selectedOptionId={selectedOptionId}
                                />
                                {isAnswered && (
                                    <div className="mt-4 space-y-4">
                                    {(mode === 'practice' || (mode === 'adaptive' && !isCorrect)) && (
                                        <Button variant="outline" size="sm" onClick={handleGetExplanation} disabled={isExplanationLoading}>
                                            {isExplanationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                                            {isExplanationLoading ? 'Generating...' : 'Explain it to me'}
                                        </Button>
                                    )}
                                        {explanation && (
                                            <Alert className="border-blue-500/50 text-blue-500 dark:text-blue-400 [&>svg]:text-blue-500 dark:[&>svg]:text-blue-400">
                                                <Lightbulb className="h-4 w-4" />
                                                <AlertTitle>Explanation</AlertTitle>
                                                <AlertDescription>
                                                    {explanation}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                        {mode === 'survival' && isPenaltyLoading && (
                                            <Alert variant="destructive">
                                                <ShieldAlert className="h-4 w-4" />
                                                <AlertTitle>Penalty Incurred!</AlertTitle>
                                                <AlertDescription>
                                                    <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                                                    Adding {SURVIVAL_PENALTY_COUNT} new questions to the queue...
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="mt-4 text-muted-foreground">Generating next question...</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <div>
                   {(mode !== 'normal' && mode !== 'exam') && isAnswered && isCorrect && <div className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /><span>Correct!</span></div>}
                   {(mode !== 'normal' && mode !== 'exam') && isAnswered && !isCorrect && <div className="flex items-center gap-2 text-red-600"><XCircle className="h-5 w-5" /><span>Incorrect</span></div>}
                </div>
                {(mode !== 'normal' && mode !== 'exam') ? (
                     <Button onClick={handleNextQuestion} disabled={isPenaltyLoading || isGeneratingNext || !isAnswered }>
                        {currentIndex === currentQuestions.length -1 && mode !== 'adaptive' ? 'Finish Quiz' : 'Next Question' }
                        {(isPenaltyLoading || isGeneratingNext) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : null}

                {(mode === 'normal' || mode === 'exam') && (
                    <Button onClick={handleFinishQuiz} disabled={Object.keys(answers).length !== currentQuestions.length}>
                        Submit Quiz
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
