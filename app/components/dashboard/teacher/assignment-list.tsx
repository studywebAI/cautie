
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
import { SubmitAssignmentDialog } from '../student/submit-assignment-dialog';
import type { ClassAssignment } from '@/contexts/app-context';
import { format, parseISO } from 'date-fns';
import { useContext, useEffect } from 'react';
import { AppContext } from '@/contexts/app-context';

type AssignmentListProps = {
  assignments: ClassAssignment[];
  classId: string;
  isTeacher?: boolean;
};

export function AssignmentList({ assignments, classId, isTeacher = true }: AssignmentListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ClassAssignment | null>(null);

  const handleSubmitClick = (assignment: ClassAssignment) => {
    setSelectedAssignment(assignment);
    setIsSubmitOpen(true);
  };

  const handleSubmissionComplete = () => {
    // Could refresh data here if needed
    setSelectedAssignment(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Assignments</CardTitle>
            <CardDescription>
              {isTeacher
                ? "An overview of all assignments for this class."
                : "Your assignments for this class."
              }
            </CardDescription>
          </div>
          {isTeacher && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Title</TableHead>
                <TableHead>Due Date</TableHead>
                {isTeacher ? (
                  <TableHead>Submissions</TableHead>
                ) : (
                  <TableHead>Status</TableHead>
                )}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => {
                  const submissionRate = 0; // Placeholder until submissions are tracked
                  const studentSubmissionStatus = Math.random() > 0.5 ? "Submitted" : "Not submitted"; // Placeholder for student status

                  return (
                      <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.title}</TableCell>
                          <TableCell>{assignment.due_date ? format(parseISO(assignment.due_date), 'MMM d, yyyy') : 'No due date'}</TableCell>
                          <TableCell>
                            {isTeacher ? (
                              <div className="flex items-center gap-2">
                                  <Progress value={submissionRate} className="h-2 w-24" />
                                  <span className="text-sm text-muted-foreground">{submissionRate}%</span>
                              </div>
                            ) : (
                              <span className={`text-sm px-2 py-1 rounded-full ${
                                studentSubmissionStatus === 'Submitted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {studentSubmissionStatus}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isTeacher ? (
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
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSubmitClick(assignment)}
                              >
                                {studentSubmissionStatus === 'Submitted' ? 'View Submission' : 'Submit Work'}
                              </Button>
                            )}
                          </TableCell>
                      </TableRow>
                  )
              })}
               {assignments.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
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
      {selectedAssignment && (
        <SubmitAssignmentDialog
          isOpen={isSubmitOpen}
          setIsOpen={setIsSubmitOpen}
          assignmentId={selectedAssignment.id}
          assignmentTitle={selectedAssignment.title}
          onSubmitted={handleSubmissionComplete}
        />
      )}
    </>
  );
}
