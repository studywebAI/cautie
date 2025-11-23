'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, PlusCircle, ArrowLeft, Play, Undo2, BookCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnimatePresence, motion } from 'framer-motion';
import { generateSingleFlashcard } from '@/ai/flows/generate-single-flashcard';
import type { Flashcard } from '@/lib/types';

type FlashcardEditorProps = {
  cards: Flashcard[];
  sourceText: string;
  onStartStudy: (finalCards: Flashcard[]) => void;
  onBack: () => void;
  isAssignmentContext?: boolean;
  onCreateForAssignment?: (finalCards: Flashcard[]) => void;
};

export function FlashcardEditor({ cards, sourceText, onStartStudy, onBack, isAssignmentContext = false, onCreateForAssignment }: FlashcardEditorProps) {
  const [currentCards, setCurrentCards] = useState<Flashcard[]>(cards);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<{ card: Flashcard; index: number } | null>(null);
  const { toast } = useToast();

  const handleAddCard = async () => {
    setIsAddingCard(true);
    try {
      const newCard = await generateSingleFlashcard({
        sourceText: sourceText,
        existingFlashcardIds: currentCards.map(c => c.front),
      });
      setCurrentCards(prevCards => [...prevCards, newCard]);
    } catch (error) {
      console.error("Failed to add flashcard:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to Add Card',
        description: 'The AI could not generate a new card. Please try again.',
      });
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    const cardIndex = currentCards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const cardToDelete = currentCards[cardIndex];
    setLastDeleted({ card: cardToDelete, index: cardIndex });

    const newCards = currentCards.filter(c => c.id !== cardId);
    setCurrentCards(newCards);
    
    toast({
      title: 'Card Deleted',
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

    const newCards = [...currentCards];
    newCards.splice(lastDeleted.index, 0, lastDeleted.card);
    setCurrentCards(newCards);
    setLastDeleted(null);
  };

  const handlePrimaryAction = () => {
    if (isAssignmentContext && onCreateForAssignment) {
      onCreateForAssignment(currentCards);
    } else {
      onStartStudy(currentCards);
    }
  };

  const primaryButtonText = isAssignmentContext
    ? `Create for Assignment (${currentCards.length} cards)`
    : `Start Studying (${currentCards.length} cards)`;

  const PrimaryButtonIcon = isAssignmentContext ? BookCheck : Play;


  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-2xl">Review & Edit Flashcards</CardTitle>
            <CardDescription>Add or remove cards before you start studying.</CardDescription>
          </div>
           <Button onClick={handleAddCard} disabled={isAddingCard}>
            {isAddingCard ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Add Card
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto pr-3">
        {currentCards.length === 0 ? (
          <Alert>
            <AlertTitle>Empty Set</AlertTitle>
            <AlertDescription>
              There are no cards in this set. Add some cards to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <AnimatePresence>
            {currentCards.map((card, index) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="p-3 border rounded-lg bg-muted/50"
              >
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground">FRONT</p>
                        <p className="font-medium">{card.front}</p>
                    </div>
                     <div>
                        <p className="text-xs font-semibold text-muted-foreground">BACK</p>
                        <p className="">{card.back}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => handleDeleteCard(card.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete card</span>
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
        <Button onClick={handlePrimaryAction} disabled={currentCards.length === 0}>
          <PrimaryButtonIcon className="mr-2 h-4 w-4" />
          {primaryButtonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
