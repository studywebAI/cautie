
'use client';

import { useState, useEffect } from 'react';
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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { PersonalTask } from '@/lib/types';


type CreateTaskDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onTaskCreated: (newTask: Omit<PersonalTask, 'id'>) => void;
  initialDate?: Date;
};

export function CreateTaskDialog({ isOpen, setIsOpen, onTaskCreated, initialDate }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setDate(initialDate);
  }, [initialDate]);

  const handleCreateTask = () => {
    if (!title) {
      toast({
        title: 'Title is required',
        description: 'Please provide a title for your task.',
        variant: 'destructive',
      });
      return;
    }
    if (!date) {
        toast({
            title: 'Date is required',
            description: 'Please select a date for your task.',
            variant: 'destructive',
        });
        return;
    }
    
    setIsLoading(true);
    // Simulate async operation
    setTimeout(() => {
      onTaskCreated({
        title,
        description,
        date,
        subject,
      });

      toast({
        title: 'Task Created',
        description: `"${title}" has been added to your agenda.`,
      });

      resetAndClose();
      setIsLoading(false);
    }, 500);
  };
  
  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setDate(initialDate);
    setSubject('');
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) resetAndClose();
        else setIsOpen(true);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Personal Task</DialogTitle>
          <DialogDescription>
            Add a new task or event to your personal agenda.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Study for Math test" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

           <div className="grid gap-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Biology" />
          </div>
          
           <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add any extra details or notes." />
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button onClick={handleCreateTask} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
