
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type Flashcard } from '@/ai/flows/generate-flashcards';
import { ChevronsLeftRight, ArrowLeft, ArrowRight, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type StudyMode = 'flip' | 'type';

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

// Sub-component for Classic Flip Mode
function FlipView({ card, isFlipped, setIsFlipped }: { card: Flashcard; isFlipped: boolean; setIsFlipped: (f: boolean) => void; }) {
  return (
    <>
      <div className="w-full max-w-md h-64 [perspective:1000px]">
        <div
          className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="absolute flex items-center justify-center p-6 w-full h-full bg-card border rounded-lg [backface-visibility:hidden]">
            <p className="text-center text-lg font-medium">{card.front}</p>
          </div>
          <div className="absolute flex items-center justify-center p-6 w-full h-full bg-card border rounded-lg [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <p className="text-center text-muted-foreground">{card.back}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <Button variant="secondary" onClick={() => setIsFlipped(!isFlipped)}>
          <ChevronsLeftRight className="mr-2 h-4 w-4" />
          Flip Card
        </Button>
      </div>
    </>
  );
}

// Sub-component for Type Mode
function TypeView({ card }: { card: Flashcard; }) {
    const [userAnswer, setUserAnswer] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsSubmitted(false);
        setUserAnswer('');
        setIsCorrect(false);
        inputRef.current?.focus();
    }, [card]);


    const handleCheckAnswer = () => {
        if (!userAnswer) return;
        const correct = userAnswer.trim().toLowerCase() === card.back.trim().toLowerCase();
        setIsCorrect(correct);
        setIsSubmitted(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isSubmitted) {
            handleCheckAnswer();
        }
    }

    return (
        <div className="w-full max-w-md h-64 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-center p-6 w-full h-32 bg-card border rounded-lg">
                 <p className="text-center text-lg font-medium">{card.front}</p>
            </div>
            
            <div className="w-full space-y-2">
                 <Input
                    ref={inputRef}
                    placeholder="Type your answer..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSubmitted}
                    className={cn(
                        'text-center text-lg h-14',
                        isSubmitted && isCorrect && 'border-green-500 focus-visible:ring-green-500',
                        isSubmitted && !isCorrect && 'border-red-500 focus-visible:ring-red-500'
                    )}
                 />
                 {isSubmitted && !isCorrect && (
                     <p className="text-sm text-center text-muted-foreground">
                         Correct answer: <span className="font-semibold text-foreground">{card.back}</span>
                     </p>
                 )}
                 {isSubmitted && (
                     <div className={cn("flex items-center justify-center gap-2 text-sm", isCorrect ? 'text-green-600' : 'text-red-600')}>
                        {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span>{isCorrect ? "Correct!" : "Incorrect"}</span>
                     </div>
                 )}
            </div>

            <div className='flex items-center justify-center'>
                 <Button variant="secondary" onClick={handleCheckAnswer} disabled={isSubmitted || !userAnswer}>
                    Check Answer
                </Button>
            </div>
        </div>
    )
}

// Main Viewer Component
export function FlashcardViewer({ cards, mode, onRestart }: { cards: Flashcard[]; mode: StudyMode; onRestart: () => void; }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentIndex === cards.length - 1) return;
    setDirection(1);
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1)), 150);
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setDirection(-1);
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1)), 150);
  };

  const card = cards[currentIndex];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Study Flashcards</CardTitle>
        <CardDescription>
          Card {currentIndex + 1} of {cards.length}. {mode === 'flip' ? "Click the card to flip it." : "Type the answer below."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 overflow-hidden min-h-[24rem]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            <div className="flex justify-center">
              {mode === 'flip' ? (
                <FlipView card={card} isFlipped={isFlipped} setIsFlipped={setIsFlipped} />
              ) : (
                <TypeView card={card} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost" onClick={onRestart}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Previous Card" disabled={currentIndex === 0}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next Card" disabled={currentIndex === cards.length - 1}>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
