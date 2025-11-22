'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateFlashcards, Flashcard } from '@/ai/flows/generate-flashcards';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { FlashcardViewer } from '@/components/tools/flashcard-viewer';


function FlashcardsPageContent() {
  const searchParams = useSearchParams();
  const sourceTextFromParams = searchParams.get('sourceText');
  
  const [sourceText, setSourceText] = useState(sourceTextFromParams || '');
  const [isLoading, setIsLoading] = useState(!!sourceTextFromParams);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (sourceTextFromParams) {
      handleGenerate(sourceTextFromParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceTextFromParams]);

  const handleGenerate = async (text: string) => {
    if (!text.trim()) {
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
      const response = await generateFlashcards({ sourceText: text });
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

  const handleFormSubmit = () => {
      handleGenerate(sourceText);
  }

  if (isLoading) {
     return (
       <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
        <div className="flex flex-col items-center gap-2 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h3 className="text-2xl font-bold tracking-tight mt-4">
                Generating Your Flashcards
            </h3>
            <p className="text-sm text-muted-foreground">
                The AI is analyzing the text. Please wait a moment...
            </p>
        </div>
      </div>
    )
  }

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
          <Button onClick={handleFormSubmit} disabled={isLoading || !sourceText}>
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

export default function FlashcardsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FlashcardsPageContent />
        </Suspense>
    )
}
