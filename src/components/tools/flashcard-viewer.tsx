'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Flashcard } from '@/ai/flows/generate-flashcards';
import { ChevronsLeftRight, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function FlashcardViewer({ cards, onRestart }: { cards: Flashcard[]; onRestart: () => void; }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 150);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 150);
  };

  const card = cards[currentIndex];

  const variants = {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Study Flashcards</CardTitle>
        <CardDescription>
          Card {currentIndex + 1} of {cards.length}. Click the card to flip it.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="w-full max-w-md h-64 [perspective:1000px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute w-full h-full"
            >
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
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Previous Card">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button variant="secondary" onClick={() => setIsFlipped(!isFlipped)}>
            <ChevronsLeftRight className="mr-2 h-4 w-4" />
            Flip Card
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next Card">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="ghost" onClick={onRestart}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </CardFooter>
    </Card>
  );
}
