
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateAssignmentDialog } from './create-assignment-dialog';
import type { ClassAssignment } from '@/contexts/app-context';
import { format, parseISO } from 'date-fns';

type AssignmentListProps = {
  assignments: ClassAssignment[];
  classId: string;
};

export function AssignmentList({ assignments, classId }: AssignmentListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Assignments</CardTitle>
            <CardDescription>An overview of all assignments for this class.</CardDescription>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Title</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => {
                  const submissionRate = 0; // Placeholder until submissions are tracked
                  const totalStudents = 20; // Placeholder
                  return (
                      <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.title}</TableCell>
                          <TableCell>{assignment.due_date ? format(parseISO(assignment.due_date), 'MMM d, yyyy') : 'No due date'}</TableCell>
                          <TableCell>
                              <div className="flex items-center gap-2">
                                  <Progress value={submissionRate} className="h-2 w-24" />
                                  <span className="text-sm text-muted-foreground">{submissionRate}%</span>
                              </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">More actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Submissions</DropdownMenuItem>
                                <DropdownMenuItem>Edit Assignment</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                      </TableRow>
                  )
              })}
               {assignments.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No assignments have been created yet.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CreateAssignmentDialog 
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        classId={classId}
      />
    </>
  );
}
