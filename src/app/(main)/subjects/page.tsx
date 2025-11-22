
import { MySubjects } from "@/components/dashboard/my-subjects";
import { generateDashboardData } from "@/ai/flows/generate-dashboard-data";

export default async function SubjectsPage() {
  const dashboardData = await generateDashboardData({
    studentName: "Alex Jansen",
    subjects: ["History", "Mathematics", "Chemistry", "English Literature"],
  });

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Your Subjects</h1>
        <p className="text-muted-foreground">
          Select a subject to view its dashboard, materials, and progress.
        </p>
      </header>
      <MySubjects subjects={dashboardData.subjects} />
    </div>
  );
}
