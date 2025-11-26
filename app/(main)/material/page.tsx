
'use client';

import { useState, useContext, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, FileText, ImageIcon, Loader2, BrainCircuit, BookCopy, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AppContext, useDictionary } from '@/contexts/app-context';
import { Label } from '@/components/ui/label';


const iconMap: { [key: string]: React.ElementType } = {
  FileText,
  BrainCircuit,
  BookCopy,
};

function MaterialPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceTextFromParams = searchParams.get('sourceText') || '';

  const [title, setTitle] = useState('');
  const [inputText, setInputText] = useState(sourceTextFromParams);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const { toast } = useToast();
  const appContext = useContext(AppContext);
  const { dictionary } = useDictionary();

  if (!appContext) {
      throw new Error("AppContext not available");
  }

  const handleGenerateTitle = async () => {
      if (!inputText) {
          toast({ variant: 'destructive', title: 'No text provided', description: 'Please enter some text to generate a title.'});
          return;
      }
      setIsGeneratingTitle(true);
      try {
          const response = await fetch('/api/ai/generate-title', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: inputText }),
          });
          if (!response.ok) throw new Error('Failed to generate title');
          const data = await response.json();
          setTitle(data.title);
      } catch (error) {
          console.error('Error generating title:', error);
          toast({ variant: 'destructive', title: 'Title generation failed', description: 'The AI could not generate a title. Please try again.'});
      } finally {
          setIsGeneratingTitle(false);
      }
  }

  const handleSaveMaterial = async () => {
      // This function is currently disabled as the processing flow is removed.
      toast({ variant: 'default', title: 'Functionality Disabled', description: 'Saving material is temporarily disabled.' });
  }

  const hasContent = !!inputText;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">{dictionary.material.title}</h1>
        <p className="text-muted-foreground">{dictionary.material.description}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.material.importTitle}</CardTitle>
          <CardDescription>{dictionary.material.importDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="grid gap-2">
            <Label htmlFor="title">Material Title</Label>
            <div className="flex gap-2">
                <Input 
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 'Photosynthesis Explained'"
                />
                <Button onClick={handleGenerateTitle} variant="outline" disabled={!inputText || isGeneratingTitle}>
                    {isGeneratingTitle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">Generate</span>
                </Button>
            </div>
        </div>

          <Textarea
            placeholder={dictionary.material.pasteText}
            className="h-48 resize-none"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
            }}
          />
          <div className="flex justify-end">
            {/* Processing button is removed, save is currently disabled */}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default function MaterialPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MaterialPageContent />
    </Suspense>
  );
}
