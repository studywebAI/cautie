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
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type Chapter = {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  subchapters?: Subchapter[];
};

type Subchapter = {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  content?: any;
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
  const [isCreateSubchapterOpen, setIsCreateSubchapterOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock data - would be fetched from API
  useEffect(() => {
    setSubject({
      id: subjectId,
      name: 'Mathematics',
      description: 'Complete mathematics curriculum with chapters and exercises',
      is_public: true
    });

    setChapters([
      {
        id: '1',
        title: 'Algebra Basics',
        description: 'Introduction to algebraic concepts and operations',
        order_index: 1,
        subchapters: [
          {
            id: '1a',
            title: 'Variables and Expressions',
            description: 'Understanding variables and basic expressions',
            order_index: 1
          },
          {
            id: '1b',
            title: 'Solving Equations',
            description: 'Methods for solving linear equations',
            order_index: 2
          }
        ]
      },
      {
        id: '2',
        title: 'Geometry',
        description: 'Geometric shapes, theorems, and proofs',
        order_index: 2,
        subchapters: [
          {
            id: '2a',
            title: 'Points, Lines, and Planes',
            description: 'Basic geometric elements',
            order_index: 1
          }
        ]
      }
    ]);
  }, [subjectId]);

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
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{chapter.title}</CardTitle>
                    <CardDescription>{chapter.description}</CardDescription>
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
                      setIsCreateSubchapterOpen(true);
                    }}>
                      Add Subchapter
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit Chapter</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {/* Subchapters */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Subchapters
                </h4>
                {chapter.subchapters?.map((subchapter) => (
                  <div key={subchapter.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{subchapter.title}</p>
                        <p className="text-sm text-muted-foreground">{subchapter.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Content
                    </Button>
                  </div>
                ))}
                {(!chapter.subchapters || chapter.subchapters.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">No subchapters yet</p>
                )}
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
            <Button onClick={() => {
              toast({
                title: 'Chapter Created',
                description: 'The new chapter has been added to your subject.',
              });
              setIsCreateChapterOpen(false);
            }}>
              Create Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Subchapter Dialog */}
      <Dialog open={isCreateSubchapterOpen} onOpenChange={setIsCreateSubchapterOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add Subchapter</DialogTitle>
            <DialogDescription>
              Create detailed content for this subchapter with AI assistance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subchapter-title">Subchapter Title</Label>
              <Input id="subchapter-title" placeholder="e.g., Variables and Expressions" />
            </div>
            <div>
              <Label htmlFor="subchapter-description">Description</Label>
              <Textarea
                id="subchapter-description"
                placeholder="Brief description of this subchapter..."
                rows={2}
              />
            </div>
            <div>
              <Label>Content Creation</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  Manual Content
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <BookOpen className="h-6 w-6" />
                  AI-Generated Notes
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <PlusCircle className="h-6 w-6" />
                  Import Existing
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSubchapterOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: 'Subchapter Created',
                description: 'The subchapter has been added to the chapter.',
              });
              setIsCreateSubchapterOpen(false);
              setSelectedChapterId(null);
            }}>
              Create Subchapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}