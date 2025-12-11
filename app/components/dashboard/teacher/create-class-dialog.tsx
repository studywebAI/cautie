
'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { Copy, Link as LinkIcon, Loader2, Share2 } from 'lucide-react';
import type { ClassInfo } from '@/contexts/app-context';

type CreateClassDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClassCreated: (newClass: { name: string; description: string }) => Promise<ClassInfo | null>;
};

export function CreateClassDialog({ isOpen, setIsOpen, onClassCreated }: CreateClassDialogProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdClass, setCreatedClass] = useState<any>(null);
  const { toast } = useToast();
  
  const inviteLink = createdClass ? `${window.location.origin}/classes/join/${createdClass.join_code}` : '';
  const qrCodeUrl = createdClass ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(inviteLink)}` : '';


  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: 'Class name is required', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const result = await onClassCreated({ name, description });
    setIsLoading(false);
    if (result) {
      setCreatedClass(result);
      setStep(2);
    }
  };
  
  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied to Clipboard!",
        description: `The class join ${type} has been copied.`,
    });
  }

  const resetAndClose = () => {
    setName('');
    setDescription('');
    setStep(1);
    setCreatedClass(null);
    setIsOpen(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        resetAndClose();
    } else {
        setIsOpen(true);
    }
  }
  
  const renderStepOne = () => (
    <>
      <DialogHeader>
          <DialogTitle>Create a New Class</DialogTitle>
          <DialogDescription>
            Enter the details for your new class. You can invite students in the next step.
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
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-description">Description (Optional)</Label>
            <Textarea
              id="class-description"
              placeholder="A brief summary of what this class will cover."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleCreate} disabled={isLoading || !name.trim()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create and Get Invite Link
          </Button>
        </DialogFooter>
    </>
  );
  
  const renderStepTwo = () => (
    <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Share2 /> Invite Students to "{createdClass?.name}"</DialogTitle>
          <DialogDescription>
            Share this QR code, link, or code with your students to have them join your class.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 items-center py-4">
            <div className="flex flex-col items-center gap-4">
                {qrCodeUrl && (
                    <div className="p-4 bg-white rounded-lg border">
                        <img src={qrCodeUrl} alt="Class Invite QR Code" width={200} height={200} />
                    </div>
                )}
            </div>
            <div className='w-full space-y-4'>
                <div className='space-y-2'>
                    <Label>Join Code</Label>
                    <div className="flex w-full items-center space-x-2">
                       <Input type="text" value={createdClass?.join_code} readOnly />
                       <Button type="submit" size="icon" onClick={() => copyToClipboard(createdClass?.join_code || '', 'code')}>
                         <Copy className="h-4 w-4" />
                       </Button>
                    </div>
                </div>
                 {inviteLink && <div className='space-y-2'>
                    <Label>Invite Link</Label>
                    <div className="flex w-full items-center space-x-2">
                       <Input type="text" value={inviteLink} readOnly />
                       <Button type="submit" size="icon" onClick={() => copyToClipboard(inviteLink, 'link')}>
                         <LinkIcon className="h-4 w-4" />
                       </Button>
                    </div>
                </div>}
            </div>
        </div>
        <DialogFooter>
            <Button onClick={resetAndClose}>Done</Button>
        </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl">
        {step === 1 ? renderStepOne() : renderStepTwo()}
      </DialogContent>
    </Dialog>
  );
}
