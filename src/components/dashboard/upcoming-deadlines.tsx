import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Deadline } from "@/lib/types";
import { useDictionary } from "@/contexts/dictionary-context";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const statusColors = {
  "on-track": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/60",
  risk: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700/60",
  behind: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/60",
};

type UpcomingDeadlinesProps = {
  deadlines: Deadline[];
};

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  const { dictionary } = useDictionary();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{dictionary.dashboard.upcomingDeadlines.title}</CardTitle>
        <CardDescription>
          {dictionary.dashboard.upcomingDeadlines.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {deadlines.slice(0,3).map((deadline) => (
           <div key={deadline.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
             <div className="flex flex-col gap-0.5">
                <p className="font-semibold">{deadline.title}</p>
                <p className="text-sm text-muted-foreground">{deadline.subject} - {dictionary.dashboard.upcomingDeadlines.due} {deadline.date}</p>
                <p className="text-xs text-muted-foreground">{deadline.workload}</p>
             </div>
             <Badge variant="outline" className={`${statusColors[deadline.status]}`}>
                {deadline.status === "on-track" && dictionary.dashboard.upcomingDeadlines.onTrack}
                {deadline.status === "risk" && dictionary.dashboard.upcomingDeadlines.risk}
                {deadline.status === "behind" && dictionary.dashboard.upcomingDeadlines.behind}
             </Badge>
           </div>
        ))}
      </CardContent>
       <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/agenda">
            {dictionary.dashboard.upcomingDeadlines.viewAgenda}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
