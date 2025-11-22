import { TodayPlan } from "@/components/dashboard/today-plan";
import { Alerts } from "@/components/dashboard/alerts";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { MySubjects } from "@/components/dashboard/my-subjects";
import { AiSuggestions } from "@/components/dashboard/ai-suggestions";
import { ProgressChart } from "@/components/dashboard/stats/progress-chart";
import { QuickAccess } from "@/components/dashboard/quick-access";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
      <div className="xl:col-span-2 flex flex-col gap-6 md:gap-8">
        <TodayPlan />
        <UpcomingDeadlines />
        <MySubjects />
        <ProgressChart />
      </div>
      <div className="flex flex-col gap-6 md:gap-8">
        <Alerts />
        <AiSuggestions />
        <QuickAccess />
      </div>
    </div>
  );
}
