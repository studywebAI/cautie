'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, FileText, ImageIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

type FileType = 'text' | 'image';

export default function MateriaalPage() {
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>('text');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadedFile(file);
      setInputText('');
      if (file.type.startsWith('image/')) {
        setFileType('image');
      } else {
        setFileType('text');
      }
    }
  };

  const handleProcess = () => {
    if (uploadedFile) {
      console.log('Processing uploaded file:', uploadedFile.name);
      // Here you would call an AI flow to process the file
    } else if (inputText) {
      console.log('Processing input text');
      // Here you would call an AI flow to process the text
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
                <Input id="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" />
              </label>
              {uploadedFile && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-background border">
                  {fileType === 'image' ? <ImageIcon className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                  <span className="text-sm font-medium truncate">{uploadedFile.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setUploadedFile(null)}>
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
                setUploadedFile(null);
                setFileType('text');
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleProcess} disabled={!uploadedFile && !inputText}>
              Verwerk met AI
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
