'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Flashcard } from '@/ai/flows/generate-flashcards';
import { ChevronsLeftRight, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { TypeView } from './type-view';
import { MultipleChoiceView } from './multiple-choice-view';

export type StudyMode = 'flip' | 'type' | 'multiple-choice';

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
    <div className='flex flex-col items-center justify-center gap-6'>
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
    </div>
  );
}

// Main Viewer Component
export function FlashcardViewer({ cards, mode, onRestart }: { cards: Flashcard[]; mode: StudyMode; onRestart: () => void; }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleNext = () => {
    if (currentIndex === cards.length - 1) return;
    setDirection(1);
    setIsFlipped(false);
    setIsAnswered(false);
    setCurrentIndex((prev) => (prev + 1));
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setDirection(-1);
    setIsFlipped(false);
    setIsAnswered(false);
    setCurrentIndex((prev) => (prev - 1));
  };
  
  const handleFlipOrCheck = () => {
    if (mode === 'flip') {
        setIsFlipped(f => !f);
    } else if (mode === 'type') {
        // Find the button and click it to trigger submission within TypeView
        const checkButton = (document.getElementById('check-answer-btn') as HTMLButtonElement);
        checkButton?.click();
    }
  }
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent shortcuts when user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }

        switch (e.key) {
            case 'ArrowRight':
                if (mode === 'flip' || isAnswered) handleNext();
                break;
            case 'ArrowLeft':
                handlePrev();
                break;
            case ' ': // Spacebar
                e.preventDefault();
                if(mode === 'flip') handleFlipOrCheck();
                break;
        }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, cards.length, mode, isAnswered]);

  const card = cards[currentIndex];

  const getModeDescription = () => {
    switch (mode) {
        case 'flip': return 'Click the card or press Spacebar to flip it.';
        case 'type': return 'Type the answer and press Enter.';
        case 'multiple-choice': return 'Select the correct answer from the options below.';
        default: return '';
    }
  }

  const renderCardContent = () => {
    switch(mode) {
        case 'flip':
            return <FlipView card={card} isFlipped={isFlipped} setIsFlipped={setIsFlipped} />;
        case 'type':
            return <TypeView card={card} onAnswered={() => setIsAnswered(true)} />;
        case 'multiple-choice':
            return <MultipleChoiceView card={card} onAnswered={() => setIsAnswered(true)} />;
        default:
            return null;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Study Flashcards</CardTitle>
        <CardDescription>
          Card {currentIndex + 1} of {cards.length}. {getModeDescription()}
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
              {renderCardContent()}
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
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNext} 
            aria-label="Next Card" 
            disabled={currentIndex === cards.length - 1 || (mode !== 'flip' && !isAnswered)}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
