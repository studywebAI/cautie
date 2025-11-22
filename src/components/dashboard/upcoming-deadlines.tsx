import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import type { Deadline } from "@/lib/types";

const statusColors = {
  "on-track": "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  risk: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
  behind: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
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
      <CardContent>
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent>
            {deadlines.map((deadline) => (
              <CarouselItem
                key={deadline.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{deadline.subject}</CardTitle>
                        <Badge
                          className={`border-transparent ${
                            statusColors[deadline.status]
                          }`}
                        >
                          {deadline.status === "on-track" && "On Track"}
                          {deadline.status === "risk" && "Risk"}
                          {deadline.status === "behind" && "Behind"}
                        </Badge>
                      </div>
                      <CardDescription>{deadline.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-end">
                      <div className="text-sm text-muted-foreground">
                        <p>{deadline.date}</p>
                        <p className="font-medium">{deadline.workload}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
