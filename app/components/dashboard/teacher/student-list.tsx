
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { MoreVertical, User, Copy, QrCode, Link as LinkIcon } from 'lucide-react';
import type { Student } from '@/lib/teacher-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

type InviteDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  classInfo: { id: string; name: string; join_code: string | null };
};

function InviteDialog({ isOpen, setIsOpen, classInfo }: InviteDialogProps) {
    const { toast } = useToast();

    const inviteLink = classInfo.join_code ? `${window.location.origin}/classes?join_code=${classInfo.join_code}` : '';
    const qrCodeUrl = inviteLink ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteLink)}&format=png` : '';

    const copyToClipboard = (text: string, type: 'link' | 'code') => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to Clipboard!",
            description: `The class join ${type} has been copied.`,
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Students to Your Class</DialogTitle>
                    <DialogDescription>
                        Students can join by scanning the QR code, using the invite link, or entering the join code.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-6 py-4">
                    {inviteLink && <div className="p-4 bg-white rounded-lg border">
                        <Image src={qrCodeUrl} alt="Class Invite QR Code" width={250} height={250} />
                    </div>}
                    <div className='w-full space-y-2'>
                        <p className='text-sm font-medium text-muted-foreground'>Join Code</p>
                        <div className="flex w-full items-center space-x-2">
                           <Input type="text" value={classInfo.join_code || 'No join code available'} readOnly />
                           <Button type="submit" size="icon" onClick={() => copyToClipboard(classInfo.join_code || '', 'code')} disabled={!classInfo.join_code}>
                             <Copy className="h-4 w-4" />
                           </Button>
                        </div>
                    </div>
                     {inviteLink && <div className='w-full space-y-2'>
                        <p className='text-sm font-medium text-muted-foreground'>Invite Link</p>
                        <div className="flex w-full items-center space-x-2">
                           <Input type="text" value={inviteLink} readOnly />
                           <Button type="submit" size="icon" onClick={() => copyToClipboard(inviteLink, 'link')}>
                             <LinkIcon className="h-4 w-4" />
                           </Button>
                        </div>
                    </div>}
                </div>
            </DialogContent>
        </Dialog>
    );
}


type StudentListProps = {
  students: Student[];
  isLoading: boolean;
  classInfo?: { id: string; name: string; join_code: string | null };
};

export function StudentList({ students, isLoading, classInfo }: StudentListProps) {
    const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Students</CardTitle>
          <CardDescription>All students enrolled in this class.</CardDescription>
        </div>
         <Button variant="outline" onClick={() => setIsInviteOpen(true)}>
          <QrCode className="mr-2 h-4 w-4" />
          Invite Students
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className='flex-1 space-y-2'>
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No students have joined this class yet. Share the class code to invite them.</p>
        ) : (
          students.map((student) => (
            <div key={student.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={student.avatarUrl || undefined} alt={student.name || 'Student'} />
                  <AvatarFallback>{student.name ? student.name.split(' ').map(n => n[0]).join('') : <User />}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{student.name || student.email}</p>
                  <div className="flex items-center gap-2">
                      <Progress value={0} className="h-1.5 w-24" />
                      <span className="text-xs text-muted-foreground">0%</span>
                  </div>
                </div>
              </div>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Student options</span>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Progress</DropdownMenuItem>
                      <DropdownMenuItem>Send Message</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove from Class</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
          ))
        )}
      </CardContent>
    </Card>
    {classInfo && <InviteDialog isOpen={isInviteOpen} setIsOpen={setIsInviteOpen} classInfo={classInfo} />}
    </>
  );
}
