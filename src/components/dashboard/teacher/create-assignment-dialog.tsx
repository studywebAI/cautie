
'use client';

import { useState, useContext } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import type { MaterialReference } from '@/lib/teacher-types';
import { CalendarIcon, BookOpen, BrainCircuit, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AppContext, AppContextType } from '@/contexts/app-context';


type CreateAssignmentDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  classId: string;
};

// Placeholder data for materials. This will be replaced with real data fetching.
const availableMaterials: MaterialReference[] = [
    { id: 'mat-1', title: 'Renaissance Art Movements Quiz', type: 'Quiz' },
    { id: 'mat-2', title: 'Key Terms: World War I', type: 'Flashcards' },
    { id: 'mat-3', title: 'Chapter 5: The Industrial Revolution', type: 'Reading' },
    { id: 'mat-4', title: 'Impressionism vs. Post-Impressionism', type: 'Reading' },
];

const materialIcons: Record<string, React.ReactNode> = {
    Quiz: <BrainCircuit className="mr-2 h-4 w-4" />,
    Flashcards: <Copy className="mr-2 h-4 w-4" />,
    Reading: <BookOpen className="mr-2 h-4 w-4" />,
}

export function CreateAssignmentDialog({ isOpen, setIsOpen, classId }: CreateAssignmentDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [materialId, setMaterialId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { createAssignment } = useContext(AppContext) as AppContextType;

  const handleCreateAssignment = async () => {
    if (!title || !dueDate || !materialId) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
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
    setMaterialId('');
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
            Assign new or existing material to your class.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Chapter 5 Quiz" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="material">Select Material</Label>
            <p className="text-sm text-muted-foreground">Choose from your existing materials or create something new.</p>
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a quiz, flashcards, or text..." />
              </SelectTrigger>
              <SelectContent>
                {availableMaterials.map(material => (
                    <SelectItem key={material.id} value={material.id}>
                        <div className="flex items-center">
                            {materialIcons[material.type]}
                            {material.title}
                        </div>
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 mt-2">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OR CREATE NEW</span>
                <Separator className="flex-1" />
            </div>
             <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="secondary" onClick={() => navigateToTool('quiz')}>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  New Quiz
                </Button>
                <Button variant="secondary" onClick={() => navigateToTool('flashcards')}>
                  <Copy className="mr-2 h-4 w-4" />
                  New Flashcards
                </Button>
            </div>
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
          
           <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add any extra instructions or context for your students." />
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
