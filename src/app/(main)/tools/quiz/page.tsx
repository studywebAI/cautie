'use client';

import React, { useState, useEffect, Suspense, useCallback, useContext } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { processMaterial } from '@/ai/flows/process-material';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, UploadCloud, FileText, ImageIcon, Swords, BookCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { QuizTaker, QuizMode } from '@/components/tools/quiz-taker';
import { AppContext } from '@/contexts/app-context';
import type { Quiz } from '@/lib/types';
import { QuizDuel } from '@/components/tools/quiz-duel';
import { QuizEditor } from '@/components/tools/quiz-editor';


function QuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceTextFromParams = searchParams.get('sourceText');
  const context = searchParams.get('context');
  const classId = searchParams.get('classId');
  const isAssignmentContext = context === 'assignment';
  
  const [sourceText, setSourceText] = useState(sourceTextFromParams || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>('practice');
  const [questionCount, setQuestionCount] = useState(7);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentView, setCurrentView] = useState<'setup' | 'edit' | 'take' | 'duel'>('setup');

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
      if (quizMode === 'duel') {
        setCurrentView('duel');
      } else {
        const count = (quizMode === 'survival' || quizMode === 'adaptive') ? 1 : questionCount;
        const response = await generateQuiz({ sourceText: text, questionCount: count });
        setGeneratedQuiz(response);
        if (isEditMode) {
          setCurrentView('edit');
        } else {
          setCurrentView('take');
        }
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'The AI could not generate a quiz. Please try again.',
      });
      setCurrentView('setup');
    } finally {
      setIsLoading(false);
    }
  }, [toast, quizMode, questionCount, isEditMode]);

  useEffect(() => {
    if (sourceTextFromParams && !isAssignmentContext) {
      handleGenerate(sourceTextFromParams);
    }
  }, [sourceTextFromParams, handleGenerate, isAssignmentContext]);

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
  
  const handleStartQuiz = (finalQuiz: Quiz) => {
    setGeneratedQuiz(finalQuiz);
    setCurrentView('take');
  }

  const handleCreateForAssignment = (finalQuiz: Quiz) => {
    // In a real app, this would save the quiz and associate it with the classId
    console.log("Creating quiz for assignment in class:", classId, finalQuiz);
    toast({
      title: "Quiz Created for Assignment",
      description: `"${finalQuiz.title}" is ready to be assigned.`,
    });
    router.push(`/class/${classId}`);
  };

  const handleRestart = () => {
    setGeneratedQuiz(null);
    setCurrentView('setup');
    if (isAssignmentContext) {
        router.push(`/class/${classId}`);
    }
  }

  const totalLoading = isLoading || isProcessingFile;
  const mainButtonAction = isAssignmentContext ? () => {
    if (isEditMode) {
      handleGenerate(sourceText);
    } else {
      // In a real app, this would trigger a final save. For now, we simulate.
      handleGenerate(sourceText);
    }
   } : handleFormSubmit;
  
  const mainButtonText = isAssignmentContext
    ? (isEditMode ? 'Proceed to Edit' : 'Generate & Create Assignment')
    : 'Generate with AI';

  const mainButtonIcon = quizMode === 'duel' 
    ? <Swords className="mr-2 h-4 w-4" /> 
    : (isAssignmentContext ? <BookCheck className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />);
  
  const finalButtonText = quizMode === 'duel'
    ? 'Start Duel'
    : mainButtonText;


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

  if (generatedQuiz && currentView === 'edit') {
    return <QuizEditor quiz={generatedQuiz} sourceText={sourceText} onStartQuiz={handleStartQuiz} onBack={() => setCurrentView('setup')} isAssignmentContext={isAssignmentContext} onCreateForAssignment={handleCreateForAssignment} />;
  }
  if (generatedQuiz && currentView === 'take') {
    return <QuizTaker quiz={generatedQuiz} mode={quizMode} sourceText={sourceText} onRestart={handleRestart} />;
  }
  if (currentView === 'duel') {
    return <QuizDuel sourceText={sourceText} onRestart={handleRestart} />
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">{isAssignmentContext ? 'Create New Quiz Assignment' : 'AI Quiz Generator'}</h1>
        <p className="text-muted-foreground">
          {isAssignmentContext ? `Create a new quiz from text or a file to assign to your class.` : `Paste text or upload a file to automatically generate a multiple-choice quiz.`}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Create a Quiz</CardTitle>
          <CardDescription>
            Provide source material, choose your settings, and let the AI build your quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex flex-col gap-4">
               <label htmlFor="file-upload" className="relative flex flex-col items-center justify-center w-full h-full min-h-[12rem] border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
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
              className="h-full min-h-[12rem] resize-none"
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
                <Label htmlFor="quiz-mode">Quiz Mode</Label>
                <Select value={quizMode} onValueChange={(value) => setQuizMode(value as QuizMode)}>
                  <SelectTrigger id="quiz-mode">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice">Practice Mode</SelectItem>
                    <SelectItem value="normal">Normal Mode</SelectItem>
                    <SelectItem value="exam">Exam Mode</SelectItem>
                    <SelectItem value="survival">Survival Mode</SelectItem>
                    <SelectItem value="speedrun">Speedrun Mode</SelectItem>
                    <SelectItem value="adaptive">Adaptive Mode</SelectItem>
                    <SelectItem value="duel">Duel Mode (1v1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="question-count">Number of Questions</Label>
                 <Select 
                    value={String(questionCount)} 
                    onValueChange={(value) => setQuestionCount(Number(value))}
                    disabled={quizMode === 'survival' || quizMode === 'adaptive' || quizMode === 'duel'}
                 >
                  <SelectTrigger id="question-count">
                    <SelectValue placeholder="Select number of questions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="7">7 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                    <SelectItem value="25">25 Questions (Short Exam)</SelectItem>
                    <SelectItem value="50">50 Questions (Long Exam)</SelectItem>
                  </SelectContent>
                </Select>
                 {(quizMode === 'survival' || quizMode === 'adaptive' || quizMode === 'duel') && <p className="text-xs text-muted-foreground">Number of questions is managed by the AI in this mode.</p>}
              </div>
           </div>
           <div className="flex items-center space-x-2">
                <Switch 
                    id="edit-mode" 
                    checked={isEditMode}
                    onCheckedChange={setIsEditMode}
                    disabled={quizMode === 'adaptive' || quizMode === 'duel'}
                />
                <Label htmlFor="edit-mode">Review & Edit Before Starting</Label>
           </div>
        </CardContent>
        <CardFooter>
          <Button onClick={mainButtonAction} disabled={totalLoading || !sourceText}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : mainButtonIcon}
            {isLoading ? 'Generating...' : finalButtonText}
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
