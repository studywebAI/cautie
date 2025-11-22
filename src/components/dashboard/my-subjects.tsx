import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { subjects } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function MySubjects() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Jouw Vakken</CardTitle>
        <CardDescription>
          Klik op een vak om naar het vak-dashboard te gaan.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <Link key={subject.id} href="#" className="group">
            <Card className="h-full transition-all duration-200 group-hover:border-primary group-hover:shadow-lg">
              <CardHeader className="p-4">
                <div className="relative h-24 w-full rounded-md overflow-hidden mb-4">
                  <Image
                    src={subject.imageUrl}
                    alt={subject.name}
                    fill
                    className="object-cover"
                    data-ai-hint={subject.imageHint}
                  />
                </div>
                <CardTitle className="text-lg">{subject.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-2">
                  <Progress value={subject.progress} className="h-2" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {subject.progress}%
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-end items-center gap-1">
                <span>Bekijk vak</span>
                <ArrowRight className="h-4 w-4" />
              </CardFooter>
            </Card>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
