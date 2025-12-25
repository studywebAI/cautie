'use client';

import { useParams } from 'next/navigation';
import { useContext, useEffect, useState, useMemo } from 'react';
import { AppContext, AppContextType, ClassInfo } from '@/contexts/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignmentList } from '@/components/dashboard/teacher/assignment-list';
import { StudentList } from '@/components/dashboard/teacher/student-list';
import type { Student } from '@/lib/teacher-types';
import { MaterialList } from '@/components/dashboard/teacher/material-list';
import { ClassSettings } from '@/components/dashboard/teacher/class-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, FileText, Settings } from 'lucide-react';


export default function ClassDetailsPage() {
  const params = useParams();
  const { classId } = params as { classId: string };
  const { classes, assignments, isLoading: isAppLoading, materials, refetchMaterials, role } = useContext(AppContext) as AppContextType;

  const [students, setStudents] = useState<Student[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);

  const classInfo: ClassInfo | undefined = useMemo(() => classes.find(c => c.id === classId), [classes, classId]);
  const classAssignments = useMemo(() => assignments.filter(a => a.class_id === classId), [assignments, classId]);


  useEffect(() => {
    if (!classId || classId.startsWith('local-')) {
        setIsStudentsLoading(false);
        setStudents([]);
        return;
    }

    const fetchStudents = async () => {
      setIsStudentsLoading(true);
      try {
        const response = await fetch(`/api/classes/${classId}/members`);
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsStudentsLoading(false);
      }
    };

    if(classId) {
        fetchStudents();
        refetchMaterials(classId);
    }
  }, [classId, refetchMaterials]);

  const isLoading = !!isAppLoading || (isStudentsLoading && classId && !classId.startsWith('local-'));

  // Check if user is a teacher (global role)
  const isTeacher = role === 'teacher';

  if (isLoading && !classInfo) {
    return (
      <div className="flex flex-col gap-8">
        <header>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div>
        <h1 className="text-3xl font-bold font-headline">Class not found</h1>
        <p className="text-muted-foreground">The class you are looking for does not exist or you do not have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">{classInfo.name}</h1>
        <p className="text-muted-foreground">{classInfo.description || 'Manage assignments, students, and settings for this class.'}</p>
      </header>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className={`grid w-full ${isTeacher ? 'grid-cols-4' : 'grid-cols-2'}`}>
          <TabsTrigger value="assignments"><FileText className="mr-2 h-4 w-4" /> Assignments</TabsTrigger>
          <TabsTrigger value="materials"><BookOpen className="mr-2 h-4 w-4" /> Materials</TabsTrigger>
          {isTeacher && (
            <>
              <TabsTrigger value="students"><Users className="mr-2 h-4 w-4" /> Students</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" /> Settings</TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value="assignments">
          <AssignmentList assignments={classAssignments} classId={classId} isTeacher={isTeacher} />
        </TabsContent>
          <TabsContent value="materials">
           <MaterialList materials={materials} classId={classId} isLoading={!!isLoading} isTeacher={isTeacher} />
         </TabsContent>
         {isTeacher && (
           <>
             <TabsContent value="students">
                <StudentList students={students} isLoading={!!isLoading} />
             </TabsContent>
             <TabsContent value="settings">
               <ClassSettings classId={classId} className={classInfo.name} onArchive={() => window.location.href = '/classes'} />
             </TabsContent>
           </>
         )}
      </Tabs>
    </div>
  );
}
