
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Link as LinkIcon } from 'lucide-react';

type JoinClassDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClassJoined: (classCode: string) => Promise<boolean>;
};

export function JoinClassDialog({ isOpen, setIsOpen, onClassJoined }: JoinClassDialogProps) {
  const [classCode, setClassCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();


  const handleJoin = async () => {
    if (!classCode.trim()) {
      toast({
        title: 'Class code is required',
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);
    const success = await onClassJoined(classCode.trim());
    setIsJoining(false);

    if (success) {
      toast({
        title: 'Successfully joined class!',
      });
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setClassCode('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) resetAndClose();
        else setIsOpen(true);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join a Class</DialogTitle>
          <DialogDescription>
            Enter the class code provided by your teacher to enroll.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="class-code">Class Code</Label>
                <Input
                  id="class-code"
                  placeholder="e.g., a1b2c3d4-e5f6-..."
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                />
            </div>
        </div>
        
        <DialogFooter>
            <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
            <Button onClick={handleJoin} disabled={isJoining || !classCode}>
              {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <LinkIcon className="mr-2 h-4 w-4" />
              Join Class
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
