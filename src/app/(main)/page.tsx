'use client';

import { TodayPlan } from "@/components/dashboard/today-plan";
import { Alerts } from "@/components/dashboard/alerts";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { AiSuggestions } from "@/components/dashboard/ai-suggestions";
import { useContext } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppContext, AppContextType } from "@/contexts/app-context";

function DashboardPageContent() {
  const { dashboardData, isLoading } = useContext(AppContext) as AppContextType;

  if (isLoading || !dashboardData) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
        <Tabs defaultValue="plan">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plan">Today's Plan</TabsTrigger>
            <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
          </TabsList>
          <TabsContent value="plan">
             <TodayPlan tasks={dashboardData.tasks} />
          </TabsContent>
          <TabsContent value="deadlines">
            <UpcomingDeadlines deadlines={dashboardData.deadlines} />
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex flex-col gap-6 md:gap-8">
        <Alerts alerts={dashboardData.alerts} />
        <AiSuggestions aiSuggestions={dashboardData.aiSuggestions} />
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
                        <Skeleton className="h-10 w-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-col gap-6 md:gap-8">
                <Skeleton className="h-48" />
                <Skeleton className="h-52" />
            </div>
        </div>
    )
}

export default function DashboardPage() {
  return (
      <DashboardPageContent />
  );
}
