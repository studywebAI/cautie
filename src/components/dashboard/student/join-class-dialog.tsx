
'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Loader2, Link as LinkIcon, Camera } from 'lucide-react';
import jsQR from 'jsqr';


type JoinClassDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClassJoined: (classCode: string) => Promise<boolean>;
};

export function JoinClassDialog({ isOpen, setIsOpen, onClassJoined }: JoinClassDialogProps) {
  const [classCode, setClassCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const handleJoin = async (codeToJoin?: string) => {
    const finalCode = (codeToJoin || classCode).trim();
    if (!finalCode) {
      toast({
        title: 'Class code is required',
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);
    const success = await onClassJoined(finalCode);
    setIsJoining(false);

    if (success) {
      toast({
        title: 'Successfully joined class!',
      });
      resetAndClose();
    }
  };
  
  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                try {
                    const url = new URL(code.data);
                    const joinCode = url.searchParams.get('join_code');
                    if (joinCode) {
                        setClassCode(joinCode);
                        handleJoin(joinCode);
                        stopScan();
                        return; // Stop the loop
                    } else {
                        toast({ variant: 'destructive', title: 'Invalid QR Code', description: 'This QR code does not contain a valid StudyWeb join link.' });
                        stopScan();
                        return;
                    }
                } catch (e) {
                    toast({ variant: 'destructive', title: 'Invalid QR Code', description: 'The scanned code is not a valid URL.' });
                    stopScan();
                    return;
                }
            }
        }
    }
    if (scanMode) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  };

  const startScan = async () => {
    setScanMode(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            animationFrameRef.current = requestAnimationFrame(tick);
        }
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser to scan a QR code.',
      });
      setScanMode(false);
    }
  };

  const stopScan = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanMode(false);
  };

  const resetAndClose = () => {
    stopScan();
    setClassCode('');
    setIsOpen(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        resetAndClose();
    } else {
        setIsOpen(true);
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join a Class</DialogTitle>
          <DialogDescription>
            Enter the class code or scan a QR code to enroll.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
            {scanMode ? (
                <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    <video ref={videoRef} playsInline className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 border-[20px] border-black/30" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-[90%] border-t-4 border-b-4 border-white/50 animate-scan" />
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="class-code">Class Code</Label>
                    <Input
                      id="class-code"
                      placeholder="e.g., a1b2c3d4-e5f6-..."
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                    />
                </div>
            )}
        </div>
        
        <DialogFooter className="sm:flex-col sm:space-y-2">
            {scanMode ? (
                 <Button onClick={stopScan}>Cancel Scan</Button>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" onClick={startScan}>
                            <Camera className="mr-2 h-4 w-4" />
                            Scan QR Code
                        </Button>
                         <Button onClick={() => handleJoin()} disabled={isJoining || !classCode}>
                          {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Join with Code
                        </Button>
                    </div>
                    <Button variant="outline" onClick={resetAndClose} className="w-full">Cancel</Button>
                </>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}