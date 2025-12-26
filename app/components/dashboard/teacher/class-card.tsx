
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, BookCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { ClassInfo, ClassAssignment } from '@/contexts/app-context';
import { differenceInDays, parseISO, isFuture } from 'date-fns';
import { useState, useEffect } from 'react';
import type { Student } from '@/lib/teacher-types';

type ClassCardProps = {
  classInfo: ClassInfo;
  onArchive?: () => void;
  isArchived?: boolean;
};

export function ClassCard({ classInfo, onArchive, isArchived = false }: ClassCardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        if (!classInfo.id || classInfo.id.startsWith('local-') || isArchived) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const [studentsRes, assignmentsRes] = await Promise.all([
                fetch(`/api/classes/${classInfo.id}/members`),
                fetch(`/api/assignments`)
            ]);

            // Handle 404 errors gracefully - class might not exist or have no members yet
            let studentsData = [];
            if (studentsRes.ok) {
                studentsData = await studentsRes.json();
            } else if (studentsRes.status === 404) {
                console.warn(`Class ${classInfo.id} not found or no members yet`);
                studentsData = [];
            } else {
                throw new Error(`Failed to fetch students: ${studentsRes.status}`);
            }

            const allAssignments = await assignmentsRes.json();

            setStudents(studentsData);
            setAssignments(allAssignments.filter((a: ClassAssignment) => a.class_id === classInfo.id));

        } catch (error) {
            console.error(`Failed to fetch data for class ${classInfo.id}`, error);
            // Set empty data on error to prevent UI issues
            setStudents([]);
            setAssignments([]);
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, [classInfo.id, isArchived]);


  const studentCount = students.length;

  const assignmentsDue = assignments.filter(a => {
    if (!a.due_date) return false;
    const dueDate = parseISO(a.due_date);
    return isFuture(dueDate) && differenceInDays(dueDate, new Date()) <= 7;
  }).length;
  
  const averageProgress = 0; // Placeholder until progress tracking is implemented
  
  const alerts: string[] = [];
  if (assignmentsDue > 0) {
    alerts.push(`${assignmentsDue} assignment${assignmentsDue > 1 ? 's are' : ' is'} due this week.`);
  }

  return (
    <Link href={`/class/${classInfo.id}`} className="group">
      <Card className={`h-full flex flex-col hover:border-primary transition-all ${isArchived ? 'opacity-75' : ''}`}>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            {classInfo.name}
            {isArchived && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Archived
              </span>
            )}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground pt-1 gap-4">
            {isArchived ? (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground italic">Archived class - data not available</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{studentCount} Student{studentCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookCheck className="h-4 w-4" />
                  <span>{assignmentsDue} Due Soon</span>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground">Average Progress</span>
              <span className="text-sm font-bold text-primary">{averageProgress}%</span>
            </div>
            <Progress value={averageProgress} className="h-2" />
          </div>
          {alerts.length > 0 && (
            <div>
              <Separator className="my-3" />
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-500">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>{alert}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Manage Class</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
