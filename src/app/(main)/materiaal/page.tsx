'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, FileText, ImageIcon, Loader2, BrainCircuit, BookCopy } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { processMaterial, ProcessMaterialOutput } from '@/ai/flows/process-material';
import { useToast } from '@/hooks/use-toast';

type FileType = 'text' | 'image' | 'file';

const iconMap = {
  FileText,
  BrainCircuit,
  BookCopy,
};

export default function MateriaalPage() {
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProcessMaterialOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setInputText('');
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileDataUri(e.target?.result as string);
       if (file.type.startsWith('image/')) {
        setFileType('image');
      } else {
        setFileType('file');
      }
    };
    reader.readAsDataURL(file);
  };
  
  const clearFile = () => {
      setUploadedFile(null);
      setFileDataUri(null);
  }

  const handleProcess = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await processMaterial({
        text: inputText,
        fileDataUri: fileDataUri || undefined,
      });
      setResult(response);
    } catch (error) {
      console.error('Error processing material:', error);
      toast({
        variant: 'destructive',
        title: 'Er is iets misgegaan',
        description: 'De AI kon het materiaal niet verwerken. Probeer het opnieuw.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Jouw Materiaal</h1>
        <p className="text-muted-foreground">
          Upload bestanden of plak tekst om samenvattingen, flashcards en meer te genereren.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Content Importeren</CardTitle>
          <CardDescription>
            Importeer een bestand of plak tekst om de AI zijn werk te laten doen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
               <label htmlFor="file-upload" className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Klik om te uploaden</span> of sleep een bestand</p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, PNG, JPG</p>
                </div>
                <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" />
              </label>
              {uploadedFile && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-background border">
                  {fileType === 'image' ? <ImageIcon className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                  <span className="text-sm font-medium truncate">{uploadedFile.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={clearFile}>
                    <span className="sr-only">Verwijder</span>
                    &times;
                  </Button>
                </div>
              )}
            </div>

            <Textarea
              placeholder="Of plak hier je tekst..."
              className="h-48 resize-none"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                clearFile();
                setResult(null);
                setFileType('text');
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleProcess} disabled={(!uploadedFile && !inputText) || isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Verwerken...' : 'Verwerk met AI'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{result.analysis.title}</CardTitle>
                <CardDescription>Onderwerp: {result.analysis.topic}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-2">Samenvatting</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.analysis.summary}</p>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">Voorgestelde Acties</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {result.suggestedActions.map((action) => {
                            const Icon = iconMap[action.icon] || BrainCircuit;
                            return (
                                <Card key={action.id} className="bg-background hover:border-primary transition-colors">
                                    <CardHeader className='flex-row items-center gap-4 space-y-0'>
                                        <Icon className="h-6 w-6 text-primary" />
                                        <CardTitle className='text-base'>{action.label}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{action.description}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="secondary" className="w-full">Selecteer</Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
