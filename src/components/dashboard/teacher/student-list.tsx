'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, MoreVertical } from 'lucide-react';
import type { Student } from '@/lib/teacher-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type StudentListProps = {
  students: Student[];
};

export function StudentList({ students }: StudentListProps) {
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
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={student.avatarUrl} alt={student.name} />
                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{student.name}</p>
                <div className="flex items-center gap-2">
                    <Progress value={student.overallProgress} className="h-1.5 w-24" />
                    <span className="text-xs text-muted-foreground">{student.overallProgress}%</span>
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
        ))}
      </CardContent>
    </Card>
  );
}
