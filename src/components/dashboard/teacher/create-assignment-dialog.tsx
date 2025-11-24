
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, BrainCircuit, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { useContext } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';


type CreateAssignmentDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  classId: string;
};

export function CreateAssignmentDialog({ isOpen, setIsOpen, classId }: CreateAssignmentDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { createAssignment } = useContext(AppContext) as AppContextType;

  const handleCreateAssignment = async () => {
    if (!title || !dueDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out at least the title and due date.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
        await createAssignment({
            title,
            due_date: format(dueDate, 'yyyy-MM-dd'),
            class_id: classId,
        });
        
        toast({
            title: 'Assignment Created',
            description: `"${title}" has been assigned.`,
        });

        resetAndClose();

    } catch (error: any) {
        toast({
            title: 'Error creating assignment',
            description: error.message || 'An unexpected error occurred.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const navigateToTool = (tool: 'quiz' | 'flashcards') => {
    setIsOpen(false);
    const params = new URLSearchParams({
      context: 'assignment',
      classId: classId,
    });
    router.push(`/tools/${tool}?${params.toString()}`);
  }
  
  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) resetAndClose();
        else setIsOpen(true);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Assign new material to your class. You can create a new quiz or flashcard set to attach.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Chapter 5 Quiz" />
          </div>
          
           <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add any extra instructions or context for your students." />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Separator />
          
           <div className="grid gap-2">
            <Label>Attach Material</Label>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary">Create New Material</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => navigateToTool('quiz')}>
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Create New Quiz
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigateToTool('flashcards')}>
                      <Copy className="mr-2 h-4 w-4" />
                      Create New Flashcards
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="secondary" onClick={() => {}} disabled>
                  Attach Existing Material (Coming Soon)
                </Button>
            </div>
          </div>
          

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button onClick={handleCreateAssignment} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
