import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { quickAccessItems } from "@/lib/mock-data";
import Link from "next/link";

export function QuickAccess() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Je materiaal</CardTitle>
        <CardDescription>Snelle toegang tot je recente items.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {quickAccessItems.map((item) => (
          <Link key={item.id} href="#">
            <div className="group flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg aspect-square text-center transition-colors hover:bg-muted">
              <item.icon className="h-8 w-8 mb-2 text-primary transition-transform group-hover:scale-110" />
              <p className="text-sm font-medium leading-tight">
                {item.title}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
