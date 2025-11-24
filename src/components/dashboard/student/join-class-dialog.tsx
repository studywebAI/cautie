
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
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
import { ScanLine, Loader2, Link as LinkIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type JoinClassDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClassJoined: (classCode: string) => Promise<boolean>;
};

export function JoinClassDialog({ isOpen, setIsOpen, onClassJoined }: JoinClassDialogProps) {
  const [classCode, setClassCode] = useState('');
  const [activeTab, setActiveTab] = useState('code');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsScanning(false);
  }, []);

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          setClassCode(code.data);
          stopCamera();
          setActiveTab('code');
          toast({
            title: 'QR Code Scanned!',
            description: 'Class code has been entered for you.',
          });
          return; // Stop the loop
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tick);
  }, [stopCamera, toast]);


  const startCamera = useCallback(async () => {
    if (streamRef.current) return;
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this feature.',
      });
      setIsScanning(false);
    }
  }, [tick, toast]);

  useEffect(() => {
    if (isOpen && activeTab === 'qr') {
      startCamera();
    } else {
      stopCamera();
    }
    // Cleanup function
    return () => {
      stopCamera();
    }
  }, [isOpen, activeTab, startCamera, stopCamera]);


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
    setActiveTab('code'); // Reset to code tab on close
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
            Enter the class code from your teacher or scan a QR code.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                          placeholder="e.g., a1b2c3d4-e5f6-..."
                          value={classCode}
                          onChange={(e) => setClassCode(e.target.value)}
                        />
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="qr">
                <div className="py-4 space-y-4">
                    <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                       <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                       <canvas ref={canvasRef} className="hidden" />

                        {isScanning && hasCameraPermission && (
                            <>
                                <ScanLine className="absolute h-48 w-48 text-primary/30" />
                                <div className="absolute top-0 h-1 w-full bg-primary/70 animate-scan" />
                                <p className="absolute bottom-4 text-sm text-white/80 bg-black/50 px-2 py-1 rounded">Position QR code within the frame</p>
                            </>
                        )}
                        {hasCameraPermission === false && (
                            <Alert variant="destructive" className="m-4">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access to scan a QR code.
                                </AlertDescription>
                            </Alert>
                        )}
                        {isScanning && hasCameraPermission === null && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                                <p className="text-white mt-2">Starting camera...</p>
                            </div>
                        )}
                    </div>
                </div>
            </TabsContent>
        </Tabs>

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
