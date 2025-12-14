'use client';

import React, { useState, useEffect, Suspense, useContext, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sparkles, BookCheck } from 'lucide-react';
import { FlashcardViewer, StudyMode } from '@/components/tools/flashcard-viewer';
import { AppContext } from '@/contexts/app-context';
import { FlashcardEditor } from '@/components/tools/flashcard-editor';
import type { Flashcard } from '@/lib/types';
import { ToolLayout } from '@/components/tools/tool-layout';


function FlashcardsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceTextFromParams = searchParams.get('sourceText');
  const context = searchParams.get('context');
  const classId = searchParams.get('classId');
  const isAssignmentContext = context === 'assignment';

  const [sourceText, setSourceText] = useState(sourceTextFromParams || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[] | null>(null);
  const [studyMode, setStudyMode] = useState<StudyMode>('flip');
  const [flashcardCount, setFlashcardCount] = useState(10);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentView, setCurrentView] = useState<'setup' | 'edit' | 'study'>('setup');

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'file' | null>(null);

  const handleGenerate = useCallback(async (text: string) => {
    if (!text.trim()) {
      return;
    }
    setIsLoading(true);
    setGeneratedCards(null);
    try {
      const apiResponse = await fetch('/api/ai/handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowName: 'generateFlashcards',
          input: { sourceText: text, count: flashcardCount },
        }),
      });
      if (!apiResponse.ok) {
        let errorMessage = apiResponse.statusText;
        try {
            const errorData = await apiResponse.json();
            if (errorData.detail) errorMessage = errorData.detail;
        } catch (e) { /* ignore */ }
        throw new Error(errorMessage);
      }
      const response = await apiResponse.json();
      setGeneratedCards(response.flashcards);
      if (isEditMode) {
        setCurrentView('edit');
      } else {
        setCurrentView('study');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setCurrentView('setup');
    } finally {
      setIsLoading(false);
    }
  }, [isEditMode, flashcardCount]);

  useEffect(() => {
    if (sourceTextFromParams && !isAssignmentContext) {
      handleGenerate(sourceTextFromParams);
    }
  }, [sourceTextFromParams, handleGenerate]);

  const handleFormSubmit = () => {
      handleGenerate(sourceText);
  }

  const handleStartStudy = (finalCards: Flashcard[]) => {
    setGeneratedCards(finalCards);
    setCurrentView('study');
  };

  const handleCreateForAssignment = (finalCards: Flashcard[]) => {
    console.log("Creating flashcards for assignment in class:", classId, finalCards);
    if (classId) {
        router.push(`/class/${classId}`);
    } else {
        router.push('/classes');
    }
  };

  const handleRestart = () => {
    setGeneratedCards(null);
    setCurrentView('setup');
     if (isAssignmentContext) {
        if (classId) {
            router.push(`/class/${classId}`);
        } else {
            router.push('/classes');
        }
    }
  };

  const totalLoading = isLoading || isProcessingFile;
  const mainButtonIcon = isAssignmentContext ? <BookCheck className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />;
  const mainButtonText = isAssignmentContext ? 'Create & Attach to Assignment' : 'Generate with AI';

  const studyModeOptions = [
    { value: 'flip', label: 'Classic Flip' },
    { value: 'type', label: 'Type (Active Recall)' },
    { value: 'multiple-choice', label: 'Multiple Choice' },
  ];

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

  if (generatedCards && currentView === 'edit') {
    return <FlashcardEditor cards={generatedCards} sourceText={sourceText} onStartStudy={handleStartStudy} onBack={handleRestart} isAssignmentContext={isAssignmentContext} />;
  }

  if (generatedCards && currentView === 'study') {
    return <FlashcardViewer cards={generatedCards} mode={studyMode} onRestart={handleRestart} />;
  }

  return (
    <ToolLayout
      title={isAssignmentContext ? 'Create New Flashcard Set' : 'Flashcards'}
      description={isAssignmentContext ? `Create a new set of flashcards to attach to your assignment.` : `Create flashcards from text, files, or previous projects.`}
      sourceText={sourceText}
      setSourceText={setSourceText}
      onGenerate={handleFormSubmit}
      isLoading={totalLoading}
      isProcessingFile={isProcessingFile}
      uploadedFile={uploadedFile}
      setUploadedFile={setUploadedFile}
      fileType={fileType}
      setFileType={setFileType}
      modeOptions={studyModeOptions}
      selectedMode={studyMode}
      onModeChange={(mode) => setStudyMode(mode as StudyMode)}
      modeButtonText="Study Mode"
      isAssignmentContext={isAssignmentContext}
    >
      <Card>
        <CardHeader>
          <CardTitle>Generate Flashcards</CardTitle>
          <CardDescription>
            Choose your settings and let the AI create your flashcards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="space-y-2">
                <Label htmlFor="flashcard-count">Number of Flashcards</Label>
                <Input
                    id="flashcard-count"
                    type="number"
                    value={flashcardCount}
                    onChange={(e) => setFlashcardCount(Number(e.target.value))}
                    min={1}
                    max={50}
                    placeholder="Enter number of flashcards"
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mode">Options</Label>
              <div className="flex items-center space-x-2">
                <Switch
                    id="edit-mode"
                    checked={isEditMode}
                    onCheckedChange={setIsEditMode}
                />
                <Label htmlFor="edit-mode" className="text-sm">Review & Edit Before Starting</Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleFormSubmit} disabled={totalLoading || !sourceText}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              mainButtonIcon
            )}
            {isLoading ? 'Generating...' : 'Generate with AI'}
          </Button>
        </CardFooter>
      </Card>
    </ToolLayout>
  );
}

export default function FlashcardsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FlashcardsPageContent />
        </Suspense>
    )
}
