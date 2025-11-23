import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MySubjectsGrid } from "./my-subjects-grid";
import type { Subject } from "@/lib/types";
import { useDictionary } from "@/contexts/dictionary-context";

type MySubjectsProps = {
  subjects: Subject[];
};

export function MySubjects({ subjects }: MySubjectsProps) {
  const { dictionary } = useDictionary();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{dictionary.dashboard.mySubjects.title}</CardTitle>
        <CardDescription>
          {dictionary.dashboard.mySubjects.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MySubjectsGrid subjects={subjects} />
      </CardContent>
    </Card>
  );
}
