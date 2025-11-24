
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, MoreVertical, User } from 'lucide-react';
import type { Student } from '@/lib/teacher-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton';

type StudentListProps = {
  students: Student[];
  isLoading: boolean;
};

export function StudentList({ students, isLoading }: StudentListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Students</CardTitle>
          <CardDescription>All students enrolled in this class.</CardDescription>
        </div>
         <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Invite
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
          <p className="text-sm text-muted-foreground text-center py-8">No students have joined this class yet.</p>
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
                      <Progress value={student.overallProgress || 0} className="h-1.5 w-24" />
                      <span className="text-xs text-muted-foreground">{student.overallProgress || 0}%</span>
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
  );
}
