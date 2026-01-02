'use client';

import { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, BookOpen, Users, Import, FileText, Upload } from 'lucide-react';
import { AppContext } from '@/contexts/app-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type Subject = {
  id: string;
  name: string;
  class_id: string;
  class_name: string;
  cover_type: string;
  cover_image_url: string | null;
  created_at: string;
};

type ClassOption = {
  id: string;
  name: string;
};

export default function SubjectsPage() {
  const context = useContext(AppContext);
  const session = context?.session;
  const classes = context?.classes || [];
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const { toast } = useToast();

  // Fetch real subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
        } else {
          console.error('Failed to fetch subjects');
          // Keep empty array if fetch fails
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
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
          <Button onClick={() => {
            setSelectedClassId('');
            setCoverImage(null);
            setIsCreateOpen(true);
          }}>
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
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {subject.class_name}
                </span>
              </div>
              <CardDescription>
                Created {new Date(subject.created_at).toLocaleDateString()}
              </CardDescription>
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
              <Label htmlFor="class-select">Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.filter(c => c.user_id === session?.user?.id).map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cover-image">Cover Image (Optional)</Label>
              <Input
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload an image to use as the subject cover. If not provided, AI-generated icons will be used.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              const nameInput = document.getElementById('subject-name') as HTMLInputElement;

              if (!nameInput?.value?.trim()) {
                toast({
                  title: 'Error',
                  description: 'Subject name is required.',
                  variant: 'destructive'
                });
                return;
              }

              if (!selectedClassId) {
                toast({
                  title: 'Error',
                  description: 'Please select a class for this subject.',
                  variant: 'destructive'
                });
                return;
              }

              try {
                // For now, skip image upload - will implement later
                let coverImageUrl = null;
                let coverType = 'ai_icons';

                const response = await fetch('/api/subjects', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: nameInput.value.trim(),
                    class_id: selectedClassId,
                    cover_image_url: coverImageUrl,
                    cover_type: coverType
                  })
                });

                if (response.ok) {
                  const newSubject = await response.json();
                  setSubjects(prev => [newSubject, ...prev]);
                  toast({
                    title: 'Subject Created',
                    description: 'Your new subject has been created successfully.',
                  });
                  setIsCreateOpen(false);
                  // Clear form
                  nameInput.value = '';
                  setSelectedClassId('');
                  setCoverImage(null);
                } else {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to create subject');
                }
              } catch (error) {
                console.error('Error creating subject:', error);
                toast({
                  title: 'Error',
                  description: error instanceof Error ? error.message : 'Failed to create subject. Please try again.',
                  variant: 'destructive'
                });
              }
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
