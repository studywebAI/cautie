'use client';

import { TodayPlan } from "@/components/dashboard/today-plan";
import { Alerts } from "@/components/dashboard/alerts";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { AiSuggestions } from "@/components/dashboard/ai-suggestions";
import { MySubjects } from "@/components/dashboard/my-subjects";
import { useContext } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AppContext, AppContextType } from "@/contexts/app-context";
import { TeacherDashboard } from "@/components/dashboard/teacher/teacher-dashboard";
import { QuickAccess } from "@/components/dashboard/quick-access";


function StudentDashboard() {
  const { dashboardData, isLoading } = useContext(AppContext) as AppContextType;

  if (isLoading || !dashboardData) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
        <TodayPlan tasks={dashboardData.tasks} />
        <UpcomingDeadlines deadlines={dashboardData.deadlines} />
        <MySubjects subjects={dashboardData.subjects.slice(0, 4)} />
      </div>
      <div className="flex flex-col gap-6 md:gap-8">
        <Alerts alerts={dashboardData.alerts} />
        <AiSuggestions aiSuggestions={dashboardData.aiSuggestions} />
        <QuickAccess quickAccessItems={dashboardData.quickAccessItems} />
      </div>
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
                        <Skeleton className="h-4 w-1/3" />
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
  const { role } = useContext(AppContext) as AppContextType;

  return (
      role === 'student' ? <StudentDashboard /> : <TeacherDashboard />
  );
}
