'use client';

import React, { useState, useContext, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sparkles } from 'lucide-react';
import { AppContext } from '@/contexts/app-context';
import { NoteViewer } from '@/components/material-viewers/note-viewer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { GenerateNotesOutput } from '@/ai/flows/generate-notes';
import { ToolLayout } from '@/components/tools/tool-layout';

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

  const handleGenerate = async (text: string) => {
    if (!text.trim()) {
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
        } catch (e) { /* ignore */ }
        throw new Error(errorMessage);
      }
      const response = await apiResponse.json();
      setGeneratedNotes(response.notes);
    } catch (error) {
      console.error('Error generating notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = () => {
    handleGenerate(sourceText);
  };

  const handleRestart = () => {
    setGeneratedNotes(null);
  };

  const totalLoading = isLoading || isProcessingFile;

  const modeOptions = [
    { value: 'structured', label: 'Structured' },
    { value: 'bullet-points', label: 'Bullet Points' },
    { value: 'standard', label: 'Standard' },
    { value: 'mindmap', label: 'Mindmap' },
    { value: 'timeline', label: 'Timeline' },
    { value: 'chart', label: 'Chart' },
    { value: 'venndiagram', label: 'Venn Diagram' },
    { value: 'vocabulary', label: 'Vocabulary' },
    { value: 'flowchart', label: 'Flowchart' },
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
    <ToolLayout
      title="Notes"
      description="Create notes from text, files, or previous projects."
      sourceText={sourceText}
      setSourceText={setSourceText}
      onGenerate={handleFormSubmit}
      isLoading={totalLoading}
      isProcessingFile={isProcessingFile}
      uploadedFile={uploadedFile}
      setUploadedFile={setUploadedFile}
      fileType={fileType}
      setFileType={setFileType}
      modeOptions={modeOptions}
      selectedMode={mode}
      onModeChange={setMode}
      modeButtonText="Note Style"
    >
      <Card>
        <CardHeader>
          <CardTitle>Generate Notes</CardTitle>
          <CardDescription>
            Customize your note generation settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
    </ToolLayout>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotesPageContent />
    </Suspense>
  );
}