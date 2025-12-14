'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UploadCloud, FileText, ImageIcon, Globe, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ToolLayoutProps {
  title: string;
  description: string;
  sourceText: string;
  setSourceText: (text: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isProcessingFile: boolean;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  fileType: 'image' | 'file' | null;
  setFileType: (type: 'image' | 'file' | null) => void;
  modeOptions: { value: string; label: string }[];
  selectedMode: string;
  onModeChange: (mode: string) => void;
  modeButtonText: string;
  children?: React.ReactNode;
  isAssignmentContext?: boolean;
}

export function ToolLayout({
  title,
  description,
  sourceText,
  setSourceText,
  onGenerate,
  isLoading,
  isProcessingFile,
  uploadedFile,
  setUploadedFile,
  fileType,
  setFileType,
  modeOptions,
  selectedMode,
  onModeChange,
  modeButtonText,
  children,
  isAssignmentContext = false,
}: ToolLayoutProps) {
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const supportedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];
    if (!supportedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported File Type',
        description: 'Please upload a supported file type: PDF, DOCX, TXT, JPG, or PNG.',
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'File size should not exceed 10MB.',
      });
      return;
    }

    setUploadedFile(file);
    setSourceText('');

    if (file.type.startsWith('image/')) {
      setFileType('image');
    } else {
      setFileType('file');
    }

    // TODO: Process file with AI to extract text
    // For now, just show a placeholder
    toast({
      title: 'File Uploaded',
      description: 'File processing will be implemented soon.',
    });
  };

  const clearFile = () => {
    setUploadedFile(null);
    setFileType(null);
  };

  const handleImportPreviousProjects = () => {
    toast({
      title: 'Import Previous Projects',
      description: 'This feature will be implemented soon.',
    });
  };

  const handleImportFromOtherApps = () => {
    toast({
      title: 'Import from Other Apps',
      description: 'This feature will be implemented soon.',
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main content area - scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-8 p-6">
          <header>
            <h1 className="text-3xl font-bold font-headline">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </header>

          {/* Tool-specific content */}
          {children}
        </div>
      </div>

      {/* Fixed bottom bar - non-scrollable */}
      <div className="border-t bg-background p-4">
        <div className="max-w-6xl mx-auto">
          {/* Mode buttons above input */}
          <div className="flex justify-center mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-sm">
                  {modeButtonText}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="top">
                {modeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onModeChange(option.value)}
                    className={selectedMode === option.value ? 'bg-accent' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Input bar with buttons */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Textarea
                placeholder="Create notes from text, files, or previous projects..."
                className="min-h-[60px] resize-none"
                value={sourceText}
                onChange={(e) => {
                  setSourceText(e.target.value);
                  setUploadedFile(null);
                  setFileType(null);
                }}
                disabled={isLoading || isProcessingFile}
              />
            </div>

            {/* Round import buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={handleImportPreviousProjects}
                disabled={isLoading || isProcessingFile}
                title="Import previous projects"
              >
                <History className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading || isProcessingFile}
                title="Import files and pictures"
              >
                <UploadCloud className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={handleImportFromOtherApps}
                disabled={isLoading || isProcessingFile}
                title="Import from other apps/websites"
              >
                <Globe className="h-5 w-5" />
              </Button>
            </div>

            {/* Hidden file input */}
            <Input
              id="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              disabled={isLoading || isProcessingFile}
            />
          </div>

          {/* File display */}
          {uploadedFile && (
            <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-muted/50 border max-w-md">
              {fileType === 'image' ? <ImageIcon className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
              <span className="text-sm font-medium truncate">{uploadedFile.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={clearFile} disabled={isLoading || isProcessingFile}>
                <span className="sr-only">Remove</span>
                ×
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}