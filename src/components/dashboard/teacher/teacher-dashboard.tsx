'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

export function TeacherDashboard() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Wrench className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight mt-4">
          Teacher Dashboard Under Construction
        </h3>
        <p className="text-sm text-muted-foreground">
          The features for class and assignment management are being built.
        </p>
      </div>
    </div>
  );
}
