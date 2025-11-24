
'use client';

import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { useContext } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AppContext, AppContextType } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, School, Users, FileText, Activity } from "lucide-react";
import { ClassCard } from "@/components/dashboard/teacher/class-card";


function StudentDashboard() {
  // This dashboard will be re-implemented once student data is connected to Supabase.
  // For now, it will show a placeholder.
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
            <UpcomingDeadlines />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6 md:gap-8">
            {/* Other student components can go here */}
        </div>
    </div>
  );
}

function TeacherSummaryDashboard() {
    const { classes, assignments, isLoading } = useContext(AppContext) as AppContextType;

    if (isLoading || !classes) {
        return <DashboardSkeleton />;
    }
    
    // Mock data for now, will be replaced with real aggregations from Supabase
    const totalStudents = classes.length * 20;
    const lowProgressAlerts = classes.length > 0 ? 3 : 0;

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-bold font-headline">Welcome Back, Teacher</h1>
                <p className="text-muted-foreground">
                    Here's a high-level summary of your classes.
                </p>
            </header>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                        <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{classes.length}</div>
                        <p className="text-xs text-muted-foreground">classes managed</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                         <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground">students across all classes</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                         <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignments.length}</div>
                        <p className="text-xs text-muted-foreground">due this week</p>
                    </CardContent>
                </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                         <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowProgressAlerts}</div>
                        <p className="text-xs text-muted-foreground">students need attention</p>
                    </CardContent>
                </Card>
            </div>
            
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline">Your Classes</CardTitle>
                            <CardDescription>A quick look at your most recent classes.</CardDescription>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/classes">
                                Manage All Classes
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.slice(0, 2).map(classInfo => (
                        <ClassCard key={classInfo.id} classInfo={classInfo} />
                    ))}
                     {classes.length === 0 && (
                        <p className="text-muted-foreground col-span-2 text-center p-8">You haven't created any classes yet. <Link href="/classes" className="text-primary hover:underline">Create one now</Link> to get started.</p>
                    )}
                </CardContent>
             </Card>

        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-32 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                         <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent>
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40" />)}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                         <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-col gap-6 md:gap-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1-3" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                         <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function DashboardPage() {
  const { role, isLoading, session } = useContext(AppContext) as AppContextType;

  if (isLoading && session) {
    return <DashboardSkeleton />;
  }

  // A different view for guest users
  if (!session) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12 text-center">
            <div className="flex flex-col items-center gap-2">
                <h3 className="text-2xl font-bold tracking-tight">
                Welcome to StudyWeb
                </h3>
                <p className="text-sm text-muted-foreground">
                Log in to see your personalized dashboard or start using the AI tools.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/login">Log In / Sign Up</Link>
                </Button>
            </div>
        </div>
    )
  }

  return (
      role === 'student' ? <StudentDashboard /> : <TeacherSummaryDashboard />
  );
}
