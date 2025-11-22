'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateFlashcards, Flashcard } from '@/ai/flows/generate-flashcards';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, ChevronsLeftRight, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function FlashcardViewer({ cards, onRestart }: { cards: Flashcard[]; onRestart: () => void; }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 150);
  };
  
  const card = cards[currentIndex];

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
           <AnimatePresence initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
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
  )
}


export default function FlashcardsPage() {
  const [sourceText, setSourceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[] | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!sourceText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Source text is empty',
        description: 'Please paste some text to generate flashcards from.',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedCards(null);
    try {
      const response = await generateFlashcards({ sourceText });
      setGeneratedCards(response.flashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'The AI could not generate flashcards. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (generatedCards) {
    return <FlashcardViewer cards={generatedCards} onRestart={() => setGeneratedCards(null)} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">AI Flashcards</h1>
        <p className="text-muted-foreground">
          Paste any text to automatically generate a set of flashcards for studying.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Generate Flashcards</CardTitle>
          <CardDescription>
            Provide the source material for your flashcard set.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your notes, a chapter from a book, or any text here..."
            className="h-48 resize-none"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : 'Generate with AI'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
