
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, BookCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { ClassInfo } from '@/contexts/app-context';

type ClassCardProps = {
  classInfo: ClassInfo;
};

export function ClassCard({ classInfo }: ClassCardProps) {

  // The following will be replaced by real data from related tables
  const studentCount = Math.floor(Math.random() * 15) + 10; // Mock student count
  const assignmentsDue = Math.floor(Math.random() * 3); // Mock assignments due
  const averageProgress = Math.floor(Math.random() * 50) + 50; // Mock progress
  const alerts = assignmentsDue > 1 ? ['Multiple assignments are due soon.'] : [];

  return (
    <Link href={`/class/${classInfo.id}`} className="group">
      <Card className="h-full flex flex-col hover:border-primary transition-all">
        <CardHeader>
          <CardTitle className="font-headline text-xl">{classInfo.name}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground pt-1 gap-4">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{studentCount} Students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookCheck className="h-4 w-4" />
              <span>{assignmentsDue} Due Soon</span>
            </div>
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
