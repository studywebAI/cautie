'use client';

import { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, BookOpen, Users, Import, FileText } from 'lucide-react';
import { AppContext } from '@/contexts/app-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type Subject = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
};

export default function SubjectsPage() {
  const context = useContext(AppContext);
  const session = context?.session;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { toast } = useToast();

  // Placeholder data - would be fetched from API
  useEffect(() => {
    // Mock subjects data
    setSubjects([
      {
        id: '1',
        name: 'Mathematics',
        description: 'Complete mathematics curriculum with chapters and exercises',
        is_public: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Physics',
        description: 'Physics principles and problem-solving',
        is_public: false,
        created_at: new Date().toISOString()
      }
    ]);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Study Materials</h1>
          <p className="text-muted-foreground">
            Organize your learning content by subject with chapters and sub-chapters.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Import className="mr-2 h-4 w-4" />
            Import Content
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Subject
          </Button>
        </div>
      </header>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                </div>
                {subject.is_public && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Public
                  </span>
                )}
              </div>
              <CardDescription>{subject.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/subjects/${subject.id}`}>
                    View Chapters
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="mr-1 h-3 w-3" />
                  Use in Class
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Subject Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Create a structured learning path with chapters and sub-chapters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input id="subject-name" placeholder="e.g., Advanced Mathematics" />
            </div>
            <div>
              <Label htmlFor="subject-description">Description</Label>
              <Textarea
                id="subject-description"
                placeholder="Describe what this subject covers..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: 'Subject Created',
                description: 'Your new subject has been created successfully.',
              });
              setIsCreateOpen(false);
            }}>
              Create Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Content Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Learning Content</DialogTitle>
            <DialogDescription>
              Upload existing quizzes, flashcards, notes, or documents to convert them into structured learning materials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-file">Select Files</Label>
              <Input id="import-file" type="file" multiple accept=".json,.txt,.pdf,.docx" />
              <p className="text-sm text-muted-foreground mt-1">
                Supported formats: JSON (flashcards/quizzes), Text files, PDFs, Word documents
              </p>
            </div>
            <div>
              <Label htmlFor="content-type">Content Type</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="flashcards">Flashcards</option>
                <option value="quiz">Quiz</option>
                <option value="notes">Notes</option>
                <option value="document">Document</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: 'Content Imported',
                description: 'Your content has been imported and will be processed.',
              });
              setIsImportOpen(false);
            }}>
              <FileText className="mr-2 h-4 w-4" />
              Import Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
