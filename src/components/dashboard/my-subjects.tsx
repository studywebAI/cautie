import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MySubjectsGrid } from "./my-subjects-grid";
import type { Subject } from "@/lib/types";

type MySubjectsProps = {
  subjects: Subject[];
};

export function MySubjects({ subjects }: MySubjectsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Your Subjects</CardTitle>
        <CardDescription>
          A quick overview of your subjects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MySubjectsGrid subjects={subjects} />
      </CardContent>
    </Card>
  );
}
