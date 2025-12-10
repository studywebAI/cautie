
'use client';

import React, { useState, useEffect, Suspense, useContext, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// Removed direct imports - using API route instead
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, UploadCloud, FileText, ImageIcon, BookCheck } from 'lucide-react';
import { FlashcardViewer, StudyMode } from '@/components/tools/flashcard-viewer';
import { AppContext } from '@/contexts/app-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FlashcardEditor } from '@/components/tools/flashcard-editor';
import type { Flashcard } from '@/lib/types';


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
  const [flashcardCount, setFlashcardCount] = useState(10); // New state for flashcard count
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentView, setCurrentView] = useState<'setup' | 'edit' | 'study'>('setup');
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'file' | null>(null);
  const { toast } = useToast();
  const appContext = useContext(AppContext);

  const handleGenerate = useCallback(async (text: string) => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Source text is empty',
        description: 'Please paste some text or upload a file to generate flashcards from.',
      });
      setIsLoading(false);
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
            if (errorData.code === "MISSING_API_KEY") {
                errorMessage = "AI is not configured (Missing API Key). Please check server logs.";
            }
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
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'The AI could not generate flashcards. Please try again.',
      });
      setCurrentView('setup');
    } finally {
      setIsLoading(false);
    }
  }, [toast, isEditMode, flashcardCount]); // Added flashcardCount to dependencies

  useEffect(() => {
    if (sourceTextFromParams && !isAssignmentContext) {
      handleGenerate(sourceTextFromParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceTextFromParams, handleGenerate]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !appContext) return;

    setUploadedFile(file);
    setSourceText('');
    setGeneratedCards(null);
    setIsProcessingFile(true);

    if (file.type.startsWith('image/')) {
        setFileType('image');
    } else {
        setFileType('file');
    }

    // Check cache first
    const cacheKey = `studyweb-file-${file.name}-${file.size}-${file.lastModified}`;
    const cachedText = sessionStorage.getItem(cacheKey);
    if (cachedText) {
      setSourceText(cachedText);
      setIsProcessingFile(false);
      toast({
        title: 'File Loaded from Cache',
        description: 'The content was previously extracted. You can now generate flashcards.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        try {
            const apiResponse = await fetch('/api/ai/handle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                flowName: 'processMaterial',
                input: {
                  fileDataUri: dataUri,
                  language: appContext.language,
                },
              }),
            });
            if (!apiResponse.ok) {
              throw new Error(`API call failed: ${apiResponse.statusText}`);
            }
            const response = await apiResponse.json();
            const extractedText = response.analysis.sourceText;
            setSourceText(extractedText);
            // Cache the extracted text
            sessionStorage.setItem(cacheKey, extractedText);
            toast({
                title: 'File Processed',
                description: 'The content has been extracted. You can now generate flashcards.',
            });
        } catch (error) {
            console.error('Error processing file:', error);
            toast({
                variant: 'destructive',
                title: 'File Processing Failed',
                description: 'The AI could not extract content from the file. Please try a different file or paste the text manually.',
            });
        } finally {
            setIsProcessingFile(false);
        }
    };
    reader.readAsDataURL(file);
  };
  
  const clearFile = () => {
      setUploadedFile(null);
      setFileType(null);
  }

  const handleFormSubmit = () => {
      handleGenerate(sourceText);
  }

  const handleStartStudy = (finalCards: Flashcard[]) => {
    setGeneratedCards(finalCards);
    setCurrentView('study');
  };
  
  const handleCreateForAssignment = (finalCards: Flashcard[]) => {
    // In a real app, this would save the flashcards and associate with the classId
    console.log("Creating flashcards for assignment in class:", classId, finalCards);
    toast({
      title: "Flashcards Created",
      description: `The new set is ready to be assigned.`,
    });
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
    return <FlashcardEditor cards={generatedCards} sourceText={sourceText} onStartStudy={handleStartStudy} onBack={handleRestart} isAssignmentContext={isAssignmentContext} onCreateForAssignment={handleCreateForAssignment} />;
  }

  if (generatedCards && currentView === 'study') {
    return <FlashcardViewer cards={generatedCards} mode={studyMode} onRestart={handleRestart} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">{isAssignmentContext ? 'Create New Flashcard Set' : 'AI Flashcards'}</h1>
        <p className="text-muted-foreground">
          {isAssignmentContext ? `Create a new set of flashcards to attach to your assignment.` : `Paste any text or upload a file to automatically generate a set of flashcards.`}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Generate Flashcards</CardTitle>
          <CardDescription>
            Provide the source material, choose your settings, and let the AI do the rest.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex flex-col gap-4">
               <label htmlFor="file-upload" className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                {isProcessingFile ? (
                    <div className="flex flex-col items-center justify-center">
                         <Loader2 className="w-10 h-10 mb-3 text-primary animate-spin" />
                         <p className="text-sm text-muted-foreground">
                           {fileType === 'image' ? 'Performing OCR on image...' : 'Extracting text from document...'}
                         </p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, PNG, JPG</p>
                        </div>
                        <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" disabled={totalLoading} />
                    </>
                )}
              </label>
              {uploadedFile && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-background border">
                  {fileType === 'image' ? <ImageIcon className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                  <span className="text-sm font-medium truncate">{uploadedFile.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={clearFile} disabled={totalLoading}>
                    <span className="sr-only">Remove</span>
                    &times;
                  </Button>
                </div>
              )}
            </div>
             <Textarea
              placeholder="Or paste your text here... The content from an uploaded file will appear here."
              className="h-48 resize-none"
              value={sourceText}
              onChange={(e) => {
                  setSourceText(e.target.value);
                  setUploadedFile(null);
                  setFileType(null);
              }}
              readOnly={isProcessingFile}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="space-y-2">
                <Label htmlFor="study-mode">Study Mode</Label>
                <Select value={studyMode} onValueChange={(value) => setStudyMode(value as StudyMode)}>
                <SelectTrigger id="study-mode" className="w-[280px]">
                    <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="flip">Classic Flip Mode</SelectItem>
                    <SelectItem value="type">Type Mode (Active Recall)</SelectItem>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                </SelectContent>
                </Select>
            </div>
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
          </div>
          <div className="flex items-center space-x-2">
                <Switch 
                    id="edit-mode" 
                    checked={isEditMode}
                    onCheckedChange={setIsEditMode}
                />
                <Label htmlFor="edit-mode">Review & Edit Before Starting</Label>
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
