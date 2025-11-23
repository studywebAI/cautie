'use client';

import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';

type CreateClassDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClassCreated: (newClass: { name: string; description: string }) => void;
};

export function CreateClassDialog({ isOpen, setIsOpen, onClassCreated }: CreateClassDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleCreate = () => {
    if (!name.trim()) {
      toast({ title: 'Class name is required', variant: 'destructive' });
      return;
    }
    onClassCreated({ name, description });
    resetAndClose();
  };

  const resetAndClose = () => {
    setName('');
    setDescription('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Class</DialogTitle>
          <DialogDescription>
            Enter the details for your new class. You can manage materials and students after it's created.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="class-name">Class Name</Label>
            <Input
              id="class-name"
              placeholder="e.g., History 101, Advanced Physics"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-description">Description (Optional)</Label>
            <Textarea
              id="class-description"
              placeholder="A brief summary of what this class will cover."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button onClick={handleCreate}>Create Class</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}