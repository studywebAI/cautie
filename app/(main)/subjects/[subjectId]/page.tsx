'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, BookOpen, FileText, ChevronRight, MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast'
import { AppContext } from '@/contexts/app-context'
import { useContext } from 'react'
import Link from 'next/link';

type Chapter = {
  id: string;
  title: string;
  chapter_number: number;
  description: string | null;
  ai_summary?: string;
  paragraphs?: Paragraph[];
};

type Paragraph = {
  id: string;
  title: string;
  paragraph_number: number;
  assignment_count: number;
  progress_percent: number;
};

type Subject = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
};

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isCreateChapterOpen, setIsCreateChapterOpen] = useState(false);
  const [isCreateParagraphOpen, setIsCreateParagraphOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch subject and chapters from API
  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        // Fetch subject info
        const subjectResponse = await fetch(`/api/subjects/${subjectId}`);
        if (subjectResponse.ok) {
          const subjectData = await subjectResponse.json();
          setSubject({
            id: subjectData.id,
            name: subjectData.title,
            description: subjectData.description || 'Subject description',
            is_public: true
          });
        }

        // Fetch chapters with paragraphs
        const chaptersResponse = await fetch(`/api/subjects/${subjectId}/chapters`);
        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();

          // For each chapter, fetch its paragraphs
          const chaptersWithParagraphs = await Promise.all(
            chaptersData.map(async (chapter: any) => {
              try {
                const paragraphsResponse = await fetch(`/api/subjects/${subjectId}/chapters/${chapter.id}/paragraphs`);
                if (paragraphsResponse.ok) {
                  const paragraphs = await paragraphsResponse.json();
                  return { ...chapter, paragraphs };
                }
                return { ...chapter, paragraphs: [] };
              } catch (error) {
                console.error(`Error fetching paragraphs for chapter ${chapter.id}:`, error);
                return { ...chapter, paragraphs: [] };
              }
            })
          );

          setChapters(chaptersWithParagraphs);
        }
      } catch (error) {
        console.error('Error fetching subject data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subject data.',
          variant: 'destructive'
        });
      }
    };

    fetchSubjectData();
  }, [subjectId, toast]);

  if (!subject) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <div className="flex items-center gap-4">
          <Link href="/subjects" className="text-muted-foreground hover:text-foreground">
            Study Materials
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold font-headline">{subject.name}</h1>
        </div>
        <p className="text-muted-foreground mt-2">{subject.description}</p>
      </header>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Chapters</h2>
        <Button onClick={() => setIsCreateChapterOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Chapter
        </Button>
      </div>

      {/* Chapters List */}
      <div className="space-y-6">
        {chapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left side - AI Summary */}
                <div className="md:col-span-1">
                  <div className="bg-muted/50 rounded-lg p-4 h-full">
                    <h4 className="font-medium text-sm mb-3">Chapter Summary</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {chapter.ai_summary || 'AI summary will be generated when content is added.'}
                    </p>
                  </div>
                </div>

                {/* Right side - Chapter content */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-lg font-semibold">{chapter.title}</h3>
                        {chapter.description && (
                          <p className="text-sm text-muted-foreground">{chapter.description}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedChapterId(chapter.id);
                          setIsCreateParagraphOpen(true);
                        }}>
                          Add Paragraph
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Chapter</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Paragraphs */}
                  <div className="space-y-3">
                    {chapter.paragraphs?.map((paragraph) => (
                  <div key={paragraph.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                          {chapter.chapter_number}.{paragraph.paragraph_number}
                        </span>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{paragraph.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {paragraph.assignment_count} assignments • {paragraph.progress_percent}% complete
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${paragraph.progress_percent}%` }}
                        />
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/subjects/${subjectId}/chapters/${chapter.id}/paragraphs/${paragraph.id}`}>
                          View Assignments ({paragraph.assignment_count})
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {(!chapter.paragraphs || chapter.paragraphs.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">No paragraphs yet</p>
                )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Chapter Dialog */}
      <Dialog open={isCreateChapterOpen} onOpenChange={setIsCreateChapterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Chapter</DialogTitle>
            <DialogDescription>
              Create a new chapter for this subject.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="chapter-title">Chapter Title</Label>
              <Input id="chapter-title" placeholder="e.g., Algebra Basics" />
            </div>
            <div>
              <Label htmlFor="chapter-description">Description</Label>
              <Textarea
                id="chapter-description"
                placeholder="Describe what this chapter covers..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateChapterOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              const titleInput = document.getElementById('chapter-title') as HTMLInputElement;
              const descriptionInput = document.getElementById('chapter-description') as HTMLTextAreaElement;

              if (!titleInput?.value?.trim()) {
                toast({
                  title: 'Error',
                  description: 'Chapter title is required.',
                  variant: 'destructive'
                });
                return;
              }

              try {
                const response = await fetch(`/api/subjects/${subjectId}/chapters`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: titleInput.value.trim(),
                    description: descriptionInput.value.trim() || null
                  })
                });

                if (response.ok) {
                  const newChapter = await response.json();
                  setChapters(prev => [...prev, { ...newChapter, paragraphs: [] }]);
                  toast({
                    title: 'Chapter Created',
                    description: 'The new chapter has been added to your subject.',
                  });
                  setIsCreateChapterOpen(false);
                  // Clear form
                  titleInput.value = '';
                  descriptionInput.value = '';
                } else {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to create chapter');
                }
              } catch (error) {
                console.error('Error creating chapter:', error);
                toast({
                  title: 'Error',
                  description: error instanceof Error ? error.message : 'Failed to create chapter. Please try again.',
                  variant: 'destructive'
                });
              }
            }}>
              Create Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Paragraph Dialog */}
      <Dialog open={isCreateParagraphOpen} onOpenChange={setIsCreateParagraphOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Paragraph</DialogTitle>
            <DialogDescription>
              Create a new paragraph for this chapter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paragraph-title">Paragraph Title</Label>
              <Input id="paragraph-title" placeholder="e.g., Basic Concepts" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateParagraphOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              const titleInput = document.getElementById('paragraph-title') as HTMLInputElement;

              if (!titleInput?.value?.trim()) {
                toast({
                  title: 'Error',
                  description: 'Paragraph title is required.',
                  variant: 'destructive'
                });
                return;
              }

              if (!selectedChapterId) {
                toast({
                  title: 'Error',
                  description: 'No chapter selected.',
                  variant: 'destructive'
                });
                return;
              }

              try {
                const response = await fetch(`/api/subjects/${subjectId}/chapters/${selectedChapterId}/paragraphs`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: titleInput.value.trim()
                  })
                });

                if (response.ok) {
                  const newParagraph = await response.json();
                  // Refresh chapters to show new paragraph
                  const chaptersResponse = await fetch(`/api/subjects/${subjectId}/chapters`);
                  if (chaptersResponse.ok) {
                    const chaptersData = await chaptersResponse.json();
                    const chaptersWithParagraphs = await Promise.all(
                      chaptersData.map(async (chapter: any) => {
                        try {
                          const paragraphsResponse = await fetch(`/api/subjects/${subjectId}/chapters/${chapter.id}/paragraphs`);
                          if (paragraphsResponse.ok) {
                            const paragraphs = await paragraphsResponse.json();
                            return { ...chapter, paragraphs };
                          }
                          return { ...chapter, paragraphs: [] };
                        } catch (error) {
                          return { ...chapter, paragraphs: [] };
                        }
                      })
                    );
                    setChapters(chaptersWithParagraphs);
                  }
                  toast({
                    title: 'Paragraph Created',
                    description: 'The new paragraph has been added to the chapter.',
                  });
                  setIsCreateParagraphOpen(false);
                  setSelectedChapterId(null);
                  // Clear form
                  titleInput.value = '';
                } else {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to create paragraph');
                }
              } catch (error) {
                console.error('Error creating paragraph:', error);
                toast({
                  title: 'Error',
                  description: error instanceof Error ? error.message : 'Failed to create paragraph. Please try again.',
                  variant: 'destructive'
                });
              }
            }}>
              Create Paragraph
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}