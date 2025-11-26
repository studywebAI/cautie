
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useDictionary } from '@/contexts/app-context';
import { PersonalTask } from '@/lib/types';

interface CreateStudyPlanDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onPlanCreated: (planTasks: Omit<PersonalTask, 'id' | 'created_at' | 'user_id'>[]) => void;
}

export function CreateStudyPlanDialog({ isOpen, setIsOpen, onPlanCreated }: CreateStudyPlanDialogProps) {
  const { dictionary } = useDictionary();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskType, setTaskType] = useState('test');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('taskType', taskType);
    formData.append('description', description);
    formData.append('dueDate', dueDate);
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch('/api/ai/create-study-plan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'An unexpected error occurred.');
      }

      const result = await response.json();
      
      // The result from our flow is { tasks: [...] }
      // We need to map them to the format expected by the AppContext
      const formattedTasks = result.tasks.map((task: any) => ({
          title: task.title,
          date: task.date,
          subject: task.subject,
          description: task.description,
          is_completed: false, // New tasks are not completed
      }));

      onPlanCreated(formattedTasks);
      setIsOpen(false);
      // Reset form on successful submission
      setDescription('');
      setFile(null);
      setDueDate('');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{dictionary.studyPlan.createTitle}</DialogTitle>
            <DialogDescription>{dictionary.studyPlan.createDescription}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
             <div className="grid gap-2">
              <Label htmlFor="task-type">{dictionary.studyPlan.taskTypeLabel}</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger id="task-type">
                  <SelectValue placeholder="Select a task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">{dictionary.studyPlan.taskTypeTest}</SelectItem>
                  <SelectItem value="homework">{dictionary.studyPlan.taskTypeHomework}</SelectItem>
                  <SelectItem value="project">{dictionary.studyPlan.taskTypeProject}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{dictionary.studyPlan.descriptionLabel}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={dictionary.studyPlan.descriptionPlaceholder}
                required
              />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="due-date">{dictionary.studyPlan.dueDateLabel}</Label>
                <Input 
                    id="due-date" 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file-upload">{dictionary.studyPlan.fileUploadLabel}</Label>
              <Input id="file-upload" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <p className="text-sm text-muted-foreground">
                {dictionary.studyPlan.fileUploadHint}
              </p>
            </div>

            {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              {dictionary.common.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {dictionary.common.loading}</>
              ) : (
                <>{dictionary.studyPlan.generateButton}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
