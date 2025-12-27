'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState, useMemo } from 'react';
import { AppContext, AppContextType, ClassInfo } from '@/contexts/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignmentList } from '@/components/dashboard/teacher/assignment-list';
import { StudentList } from '@/components/dashboard/teacher/student-list';
import type { Student } from '@/lib/teacher-types';
import { MaterialList } from '@/components/dashboard/teacher/material-list';
import { ClassSettings } from '@/components/dashboard/teacher/class-settings';
import { SubjectsGrid } from '@/components/dashboard/subjects-grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, FileText, Settings, GraduationCap } from 'lucide-react';


export default function ClassDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { classId } = params as { classId: string };
  const { classes, assignments, isLoading: isAppLoading, materials, refetchMaterials, role } = useContext(AppContext) as AppContextType;

  const [students, setStudents] = useState<Student[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);
  const [directClassInfo, setDirectClassInfo] = useState<ClassInfo | null>(null);

  // Get current view from URL params or default to subjects
  const currentView = searchParams.get('view') || 'subjects';

  const classInfo: ClassInfo | undefined = useMemo(() => {
    // First try to find in context
    const contextClass = classes.find(c => c.id === classId);
    if (contextClass) return contextClass;

    // If not found in context, use directly fetched class
    return directClassInfo || undefined;
  }, [classes, classId, directClassInfo]);


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

  // Fetch class info directly if not found in context (for archived classes)
  useEffect(() => {
    if (!classId || classId.startsWith('local-')) return;

    const contextClass = classes.find(c => c.id === classId);
    if (contextClass || directClassInfo) return; // Already have the class info

    const fetchClassInfo = async () => {
      try {
        const response = await fetch(`/api/classes/${classId}`);
        if (response.ok) {
          const classData = await response.json();
          setDirectClassInfo(classData);
        }
      } catch (error) {
        console.error('Failed to fetch class info:', error);
      }
    };

    fetchClassInfo();
  }, [classId, classes, directClassInfo]);

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

  const navigationItems = [
    { id: 'subjects', label: 'Subjects', icon: GraduationCap, showForStudents: true },
    { id: 'assignments', label: 'Assignments', icon: FileText, showForStudents: true },
    { id: 'materials', label: 'Materials', icon: BookOpen, showForStudents: true },
    { id: 'students', label: 'Students', icon: Users, showForStudents: false },
    { id: 'settings', label: 'Settings', icon: Settings, showForStudents: false },
  ];

  const updateView = (view: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.pushState({}, '', url.toString());
    // Force a re-render by updating state
    window.location.reload();
  };

  return (
    <div className="flex gap-6">
      {/* Mini Sidebar Navigation */}
      <div className="w-64 flex-shrink-0">
        <div className="sticky top-6">
          <div className="bg-card border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
              Navigation
            </h3>
            {navigationItems
              .filter(item => isTeacher || item.showForStudents)
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => updateView(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold font-headline">{classInfo.name}</h1>
            <p className="text-muted-foreground">
              {currentView === 'subjects'
                ? 'Explore and continue your learning journey'
                : currentView === 'assignments'
                ? 'View and manage assignments'
                : currentView === 'materials'
                ? 'Access learning materials'
                : currentView === 'students'
                ? 'Manage class students'
                : 'Configure class settings'
              }
            </p>
          </header>

          {currentView === 'subjects' && (
            <SubjectsGrid classId={classId} isTeacher={isTeacher} />
          )}

          {currentView === 'assignments' && (
            <AssignmentList assignments={[]} classId={classId} isTeacher={isTeacher} />
          )}

          {currentView === 'materials' && (
            <MaterialList materials={materials} classId={classId} isLoading={!!isLoading} isTeacher={isTeacher} />
          )}

          {currentView === 'students' && isTeacher && (
            <StudentList students={students} isLoading={!!isLoading} classInfo={classInfo} />
          )}

          {currentView === 'settings' && isTeacher && (
            <ClassSettings
              classId={classId}
              className={classInfo.name}
              isArchived={classInfo.status === 'archived'}
              onArchive={() => window.location.href = '/classes'}
            />
          )}
        </div>
      </div>
    </div>
  );
}