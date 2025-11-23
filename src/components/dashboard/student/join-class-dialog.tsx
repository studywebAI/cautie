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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { QrCode, ScanLine } from 'lucide-react';

type JoinClassDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClassJoined: (classCode: string) => void;
};

export function JoinClassDialog({ isOpen, setIsOpen, onClassJoined }: JoinClassDialogProps) {
  const [classCode, setClassCode] = useState('');
  const { toast } = useToast();

  const handleJoin = () => {
    if (!classCode.trim()) {
      toast({
        title: 'Class code is required',
        variant: 'destructive',
      });
      return;
    }
    // In a real app, you'd validate the code here
    onClassJoined(classCode);
    toast({
      title: 'Successfully joined class!',
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setClassCode('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join a Class</DialogTitle>
          <DialogDescription>
            Enter the class code from your teacher or scan a QR code.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code">Enter Code</TabsTrigger>
                <TabsTrigger value="qr">Scan QR</TabsTrigger>
            </TabsList>
            <TabsContent value="code">
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="class-code">Class Code</Label>
                        <Input
                        id="class-code"
                        placeholder="e.g., A4B-C8D"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value)}
                        />
                    </div>
                     <Button onClick={handleJoin} className="w-full">
                        Join Class
                    </Button>
                </div>
            </TabsContent>
            <TabsContent value="qr">
                <div className="py-4 space-y-4">
                    <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                       <ScanLine className="h-48 w-48 text-muted-foreground/30" />
                       <div className="absolute top-0 h-1 w-full bg-primary/70 animate-[scan_3s_ease-in-out_infinite]" />
                       <p className="absolute bottom-4 text-sm text-muted-foreground">Position QR code within the frame</p>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

@keyframes scan {
  0% {
    transform: translateY(-100%);
  }
  50% {
    transform: translateY(2000%);
  }
  100% {
    transform: translateY(-100%);
  }
}
