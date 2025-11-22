import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Deadline } from "@/lib/types";

const statusColors = {
  "on-track": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/60",
  risk: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700/60",
  behind: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/60",
};

type UpcomingDeadlinesProps = {
  deadlines: Deadline[];
};

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Upcoming Deadlines</CardTitle>
        <CardDescription>
          An overview of your upcoming assignments and tests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {deadlines.map((deadline) => (
           <div key={deadline.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
             <div className="flex flex-col gap-0.5">
                <p className="font-semibold">{deadline.title}</p>
                <p className="text-sm text-muted-foreground">{deadline.subject} - Due {deadline.date}</p>
                <p className="text-xs text-muted-foreground">{deadline.workload}</p>
             </div>
             <Badge variant="outline" className={`${statusColors[deadline.status]}`}>
                {deadline.status === "on-track" && "On Track"}
                {deadline.status === "risk" && "Risk"}
                {deadline.status === "behind" && "Behind"}
             </Badge>
           </div>
        ))}
      </CardContent>
    </Card>
  );
}
