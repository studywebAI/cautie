import { TodayPlan } from "@/components/dashboard/today-plan";
import { Alerts } from "@/components/dashboard/alerts";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { MySubjects } from "@/components/dashboard/my-subjects";
import { AiSuggestions } from "@/components/dashboard/ai-suggestions";
import { ProgressChart } from "@/components/dashboard/stats/progress-chart";
import { QuickAccess } from "@/components/dashboard/quick-access";
import { generateDashboardData } from "@/ai/flows/generate-dashboard-data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardPageContent({ dashboardData }: { dashboardData: any }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
      <div className="xl:col-span-2 flex flex-col gap-6 md:gap-8">
        <TodayPlan tasks={dashboardData.tasks} />
        <UpcomingDeadlines deadlines={dashboardData.deadlines} />
        <MySubjects subjects={dashboardData.subjects} />
        <ProgressChart progressData={dashboardData.progressData} />
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            <div className="xl:col-span-2 flex flex-col gap-6 md:gap-8">
                <Skeleton className="h-72" />
                <Skeleton className="h-60" />
                <Skeleton className="h-60" />
                <Skeleton className="h-72" />
            </div>
            <div className="flex flex-col gap-6 md:gap-8">
                <Skeleton className="h-48" />
                <Skeleton className="h-52" />
                <Skeleton className="h-52" />
            </div>
        </div>
    )
}

export default async function DashboardPage() {
  const dashboardData = await generateDashboardData({
    studentName: "Alex Jansen",
    subjects: ["History", "Mathematics", "Chemistry", "English Literature"],
  });

  return (
     <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPageContent dashboardData={dashboardData} />
    </Suspense>
  );
}