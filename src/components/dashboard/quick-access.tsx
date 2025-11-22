import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { QuickAccessItem } from "@/lib/types";
import Link from "next/link";
import { Notebook, File, BrainCircuit, FileText } from "lucide-react";

const iconMap = {
  Notebook,
  File,
  BrainCircuit,
  FileText,
};

type QuickAccessProps = {
  quickAccessItems: QuickAccessItem[];
};

export function QuickAccess({ quickAccessItems }: QuickAccessProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Your Material</CardTitle>
        <CardDescription>Quick access to your recent items.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {quickAccessItems.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap] || File;
          return (
            <Link key={item.id} href="#">
              <div className="group flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg aspect-square text-center transition-colors hover:bg-muted">
                <Icon className="h-8 w-8 mb-2 text-primary transition-transform group-hover:scale-110" />
                <p className="text-sm font-medium leading-tight">
                  {item.title}
                </p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
