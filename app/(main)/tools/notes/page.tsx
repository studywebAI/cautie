'use client';

import React, { useState, useContext, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, UploadCloud, FileText, ImageIcon } from 'lucide-react';
import { AppContext } from '@/contexts/app-context';
import { NoteViewer } from '@/components/material-viewers/note-viewer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { GenerateNotesOutput } from '@/ai/flows/generate-notes';

function NotesPageContent() {
  const searchParams = useSearchParams();
  const sourceTextFromParams = searchParams.get('sourceText');

  const [sourceText, setSourceText] = useState(sourceTextFromParams || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<GenerateNotesOutput['notes'] | null>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'file' | null>(null);
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [mode, setMode] = useState('structured');
  const [highlightTitles, setHighlightTitles] = useState(false);
  const [fontFamily, setFontFamily] = useState<'default' | 'serif' | 'sans-serif' | 'monospace'>('default');
  const { toast } = useToast();
  const appContext = useContext(AppContext);

  const handleGenerate = async (text: string) => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Source text is empty',
        description: 'Please paste some text or upload a file to generate notes from.',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedNotes(null);
    try {
      const apiResponse = await fetch('/api/ai/handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowName: 'generateNotes',
          input: { sourceText: text, topic: topic || undefined, length, style: mode, highlightTitles, fontFamily },
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
      setGeneratedNotes(response.notes);
    } catch (error) {
      console.error('Error generating notes:', error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'The AI could not generate notes. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !appContext) return;

    setUploadedFile(file);
    setSourceText('');
    setGeneratedNotes(null);
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
        description: 'The content was previously extracted. You can now generate notes.',
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
          description: 'The content has been extracted. You can now generate notes.',
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
  };

  const handleFormSubmit = () => {
    handleGenerate(sourceText);
  };

  const handleRestart = () => {
    setGeneratedNotes(null);
  };

  const totalLoading = isLoading || isProcessingFile;

  const modeOptions = [
    'structured', 'bullet-points', 'standard', 'mindmap', 'timeline', 'chart', 'venndiagram', 'vocabulary', 'flowchart'
  ];

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h3 className="text-2xl font-bold tracking-tight mt-4">
            Generating Your Notes
          </h3>
          <p className="text-sm text-muted-foreground">
            The AI is analyzing the text. Please wait a moment...
          </p>
        </div>
      </div>
    );
  }

  if (generatedNotes) {
    return (
      <div className="flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Notes</h1>
            <p className="text-muted-foreground">
              Your automatically generated notes.
            </p>
          </div>
          <Button onClick={handleRestart} variant="outline">
            Generate New Notes
          </Button>
        </header>
        <NoteViewer notes={generatedNotes} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Notes</h1>
        <p className="text-muted-foreground">
          Create notes from text files or previous projects.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Generate Notes</CardTitle>
          <CardDescription>
            Provide the source material and customize your note generation settings.
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
                  {fileType === 'image' ? (
                    <img
                      src={URL.createObjectURL(uploadedFile)}
                      alt="Preview"
                      className="h-8 w-8 object-cover rounded"
                    />
                  ) : (
                    <FileText className="h-5 w-5 text-primary" />
                  )}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic (optional)</Label>
              <Input
                id="topic"
                placeholder="e.g., Biology, History..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Select value={length} onValueChange={(value) => setLength(value as typeof length)}>
                <SelectTrigger id="length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger id="mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Select value={fontFamily} onValueChange={(value) => setFontFamily(value as typeof fontFamily)}>
                <SelectTrigger id="font-family">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="sans-serif">Sans Serif</SelectItem>
                  <SelectItem value="monospace">Monospace</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="highlight-titles"
                checked={highlightTitles}
                onCheckedChange={setHighlightTitles}
              />
              <Label htmlFor="highlight-titles">Highlight Titles</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={handleFormSubmit} disabled={totalLoading || !sourceText}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : 'Generate Notes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotesPageContent />
    </Suspense>
  );
}