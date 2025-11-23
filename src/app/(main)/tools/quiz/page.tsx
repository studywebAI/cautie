'use client';

import React, { useState, useEffect, Suspense, useCallback, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateQuiz, Quiz } from '@/ai/flows/generate-quiz';
import { processMaterial } from '@/ai/flows/process-material';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, UploadCloud, FileText, ImageIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QuizTaker, QuizMode } from '@/components/tools/quiz-taker';
import { AppContext } from '@/contexts/app-context';


function QuizPageContent() {
  const searchParams = useSearchParams();
  const sourceTextFromParams = searchParams.get('sourceText');
  
  const [sourceText, setSourceText] = useState(sourceTextFromParams || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>('practice');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'file' | null>(null);
  const { toast } = useToast();
  const appContext = useContext(AppContext);

  const handleGenerate = useCallback(async (text: string) => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Source text is empty',
        description: 'Please paste some text or upload a file to generate a quiz from.',
      });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setGeneratedQuiz(null);
    try {
      const questionCount = quizMode === 'survival' || quizMode === 'adaptive' || quizMode === 'endless' ? 1 : 7;
      const response = await generateQuiz({ sourceText: text, questionCount });
      setGeneratedQuiz(response);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'The AI could not generate a quiz. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, quizMode]);

  useEffect(() => {
    if (sourceTextFromParams) {
      // Don't set loading to true here, let handleGenerate do it.
      handleGenerate(sourceTextFromParams);
    }
  }, [sourceTextFromParams, handleGenerate]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !appContext) return;

    setUploadedFile(file);
    setSourceText('');
    setGeneratedQuiz(null);
    setIsProcessingFile(true);

    if (file.type.startsWith('image/')) {
        setFileType('image');
    } else {
        setFileType('file');
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        try {
            const response = await processMaterial({
                fileDataUri: dataUri,
                language: appContext.language,
            });
            setSourceText(response.analysis.sourceText);
            toast({
                title: 'File Processed',
                description: 'The content has been extracted. You can now generate a quiz.',
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
  
  const totalLoading = isLoading || isProcessingFile;

  if (isLoading) {
    return (
       <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
        <div className="flex flex-col items-center gap-2 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h3 className="text-2xl font-bold tracking-tight mt-4">
                Generating Your Quiz
            </h3>
            <p className="text-sm text-muted-foreground">
                The AI is working its magic. Please wait a moment...
            </p>
        </div>
      </div>
    )
  }

  if (generatedQuiz) {
    return <QuizTaker quiz={generatedQuiz} mode={quizMode} sourceText={sourceText} onRestart={() => setGeneratedQuiz(null)} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">AI Quiz Generator</h1>
        <p className="text-muted-foreground">
          Paste text or upload a file to automatically generate a multiple-choice quiz.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Create a Quiz</CardTitle>
          <CardDescription>
            Provide source material by uploading a file or pasting text, then choose a mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex flex-col gap-4">
               <label htmlFor="file-upload" className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                {isProcessingFile ? (
                    <div className="flex flex-col items-center justify-center">
                         <Loader2 className="w-10 h-10 mb-3 text-primary animate-spin" />
                         <p className="text-sm text-muted-foreground">Processing file...</p>
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

           <div className="space-y-2">
              <Label htmlFor="quiz-mode">Quiz Mode</Label>
              <Select value={quizMode} onValueChange={(value) => setQuizMode(value as QuizMode)}>
                <SelectTrigger id="quiz-mode" className="w-[280px]">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practice">Practice Mode</SelectItem>
                  <SelectItem value="normal">Normal Mode</SelectItem>
                  <SelectItem value="exam">Exam Mode</SelectItem>
                  <SelectItem value="survival">Survival Mode</SelectItem>
                  <SelectItem value="speedrun">Speedrun Mode</SelectItem>
                  <SelectItem value="adaptive">Adaptive Mode</SelectItem>
                  <SelectItem value="endless">Endless Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleFormSubmit} disabled={totalLoading || !sourceText}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading ? 'Generating...' : 'Generate with AI'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function QuizPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QuizPageContent />
        </Suspense>
    )
}
