'use client';

import { useState, useContext, useMemo } from 'react';
import { format, addDays, parse } from 'date-fns';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { useDictionary } from '@/contexts/dictionary-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import type { Deadline } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// Helper to parse the AI-generated relative date string into an actual Date object
const parseAIDate = (baseDate: Date, aiDate: string): Date => {
  if (aiDate.toLowerCase() === 'tomorrow') {
    return addDays(baseDate, 1);
  }
  const match = aiDate.match(/in (\d+) days/i);
  if (match) {
    return addDays(baseDate, parseInt(match[1], 10));
  }
  // Fallback for other formats, though the AI is prompted for "In X days"
  try {
    const parsed = parse(aiDate, 'yyyy-MM-dd', baseDate);
    if (!isNaN(parsed.getTime())) return parsed;
  } catch(e) {
    // Ignore parse errors
  }
  return baseDate; // Default to today if unparseable
};

export default function AgendaPage() {
  const { studentDashboardData, isLoading } = useContext(AppContext) as AppContextType;
  const { dictionary } = useDictionary();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  
  const today = new Date();
  
  // Memoize the mapped events so it's not re-calculated on every render
  const eventsByDate = useMemo(() => {
    if (!studentDashboardData?.deadlines) {
      return new Map<string, Deadline[]>();
    }

    const map = new Map<string, Deadline[]>();
    studentDashboardData.deadlines.forEach(deadline => {
      const date = parseAIDate(today, deadline.date);
      const dateString = format(date, 'yyyy-MM-dd');
      if (!map.has(dateString)) {
        map.set(dateString, []);
      }
      map.get(dateString)?.push(deadline);
    });
    return map;
  }, [studentDashboardData, today]);
  
  const selectedDayString = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '';
  const eventsForSelectedDay = eventsByDate.get(selectedDayString) || [];
  
  const eventDays = Array.from(eventsByDate.keys()).map(dateString => new Date(dateString));

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <Skeleton className="h-[400px] w-full" />
            </div>
            <div>
                 <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">{dictionary.agenda.title}</h1>
        <p className="text-muted-foreground">{dictionary.agenda.description}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card>
                <CardContent className="p-2">
                    <Calendar
                        mode="single"
                        selected={selectedDay}
                        onSelect={setSelectedDay}
                        className="w-full"
                        modifiers={{ event: eventDays }}
                        modifiersClassNames={{
                            event: 'border-2 border-primary/50 rounded-full'
                        }}
                    />
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">
                        {dictionary.agenda.eventsOn} {selectedDay ? format(selectedDay, 'MMMM d') : ''}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {eventsForSelectedDay.length > 0 ? (
                        eventsForSelectedDay.map(event => (
                            <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-sm text-muted-foreground">{event.subject}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            {dictionary.agenda.noEvents}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
