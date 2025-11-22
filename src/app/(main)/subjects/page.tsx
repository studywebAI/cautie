import { MySubjects } from "@/components/dashboard/my-subjects";
import { generateDashboardData } from "@/ai/flows/generate-dashboard-data";

// Note: This page is temporarily using static data to improve navigation speed.
// The real subject dashboard will be built out later.

const staticSubjects = [
    {
      "id": "SUBJ_HIST_01",
      "name": "History",
      "progress": 65,
      "imageUrl": "https://picsum.photos/seed/history/600/400",
      "imageHint": "history book"
    },
    {
      "id": "SUBJ_MATH_02",
      "name": "Mathematics",
      "progress": 82,
      "imageUrl": "https://picsum.photos/seed/math/600/400",
      "imageHint": "math equation"
    },
    {
      "id": "SUBJ_CHEM_03",
      "name": "Chemistry",
      "progress": 45,
      "imageUrl": "https://picsum.photos/seed/chemistry/600/400",
      "imageHint": "science beaker"
    },
    {
      "id": "SUBJ_ENG_04",
      "name": "English Literature",
      "progress": 76,
      "imageUrl": "https://picsum.photos/seed/literature/600/400",
      "imageHint": "classic novel"
    }
  ];


export default async function SubjectsPage() {
  // const dashboardData = await generateDashboardData({
  //   studentName: "Alex Jansen",
  //   subjects: ["History", "Mathematics", "Chemistry", "English Literature"],
  // });

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Your Subjects</h1>
        <p className="text-muted-foreground">
          Select a subject to view its dashboard, materials, and progress.
        </p>
      </header>
      <MySubjects subjects={staticSubjects} />
    </div>
  );
}
