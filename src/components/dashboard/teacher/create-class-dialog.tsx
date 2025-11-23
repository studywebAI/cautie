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
import { Loader2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateClassIdeas } from '@/ai/flows/generate-class-ideas';
import type { ClassIdea } from '@/lib/teacher-types';

type CreateClassDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClassCreated: (newClass: { name: string; description: string }) => void;
};

export function CreateClassDialog({ isOpen, setIsOpen, onClassCreated }: CreateClassDialogProps) {
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState('');
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [ideas, setIdeas] = useState<ClassIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ClassIdea | null>(null);
  const [customClassName, setCustomClassName] = useState('');
  const [customClassDesc, setCustomClassDesc] = useState('');
  const { toast } = useToast();

  const handleGenerateIdeas = async () => {
    if (!subject.trim()) {
      toast({ title: 'Subject is required', variant: 'destructive' });
      return;
    }
    setIsLoadingIdeas(true);
    try {
      const result = await generateClassIdeas({ subject });
      setIdeas(result.ideas);
      setStep(2);
    } catch (error) {
      console.error('Failed to generate class ideas:', error);
      toast({ title: 'Failed to generate ideas', description: 'The AI could not generate ideas. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const handleSelectIdea = (idea: ClassIdea) => {
    setSelectedIdea(idea);
    setCustomClassName(idea.name);
    setCustomClassDesc(idea.description);
    setStep(3);
  };

  const handleCustomSetup = () => {
    setSelectedIdea(null); // It's a custom setup, no pre-selected idea
    setCustomClassName('');
    setCustomClassDesc('');
    setStep(3);
  };
  
  const handleFinalize = () => {
    if (!customClassName.trim()) {
      toast({ title: 'Class name is required', variant: 'destructive' });
      return;
    }
    onClassCreated({
        name: customClassName,
        description: customClassDesc,
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setSubject('');
    setIdeas([]);
    setSelectedIdea(null);
    setCustomClassName('');
    setCustomClassDesc('');
    setIsOpen(false);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Create a New Class</DialogTitle>
              <DialogDescription>What subject do you want to create a class for? Let AI help you with some ideas.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., History, Physics, Literature"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
              <Button onClick={handleGenerateIdeas} disabled={isLoadingIdeas}>
                {isLoadingIdeas ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Get AI Ideas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        );
      case 2:
        return (
           <>
            <DialogHeader>
              <DialogTitle>Choose a Class Idea</DialogTitle>
              <DialogDescription>Select one of the AI-generated ideas, or set it up manually.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
                {ideas.map((idea) => (
                    <button key={idea.id} onClick={() => handleSelectIdea(idea)} className="w-full text-left p-4 rounded-lg border bg-background hover:bg-muted hover:border-primary transition-all">
                        <p className="font-semibold">{idea.name}</p>
                        <p className="text-sm text-muted-foreground">{idea.description}</p>
                    </button>
                ))}
            </div>
            <DialogFooter className="justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button variant="secondary" onClick={handleCustomSetup}>
                    Setup Manually
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </DialogFooter>
          </>
        );
        case 3:
        return (
           <>
            <DialogHeader>
              <DialogTitle>Finalize Your Class</DialogTitle>
              <DialogDescription>Confirm the details for your new class. You can edit these later.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                <Label htmlFor="class-name">Class Name</Label>
                <Input
                  id="class-name"
                  value={customClassName}
                  onChange={(e) => setCustomClassName(e.target.value)}
                  placeholder="e.g., The Age of Revolutions"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="class-description">Description (Optional)</Label>
                <Textarea
                  id="class-description"
                  value={customClassDesc}
                  onChange={(e) => setCustomClassDesc(e.target.value)}
                  placeholder="A brief summary of the class."
                />
              </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setStep(ideas.length > 0 ? 2 : 1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button onClick={handleFinalize}>
                    Create Class
                </Button>
            </DialogFooter>
          </>
        )
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) resetAndClose();
        else setIsOpen(true);
    }}>
      <DialogContent className="sm:max-w-md">
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
