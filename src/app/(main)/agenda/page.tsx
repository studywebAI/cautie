
'use client';

import { useState, useContext, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { useDictionary } from '@/contexts/dictionary-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { BookCheck, BrainCircuit } from 'lucide-react';

type CalendarEvent = {
  id: string;
  title: string;
  subject: string;
  date: Date;
  type: 'assignment' | 'study_plan' | 'personal';
};

export default function AgendaPage() {
  const { assignments, classes, isLoading, role } = useContext(AppContext) as AppContextType;
  const { dictionary } = useDictionary();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  
  const isStudent = role === 'student';

  const events: CalendarEvent[] = useMemo(() => {
    if (!isStudent || !assignments || !classes) return [];
    
    return assignments
        .filter(a => a.due_date)
        .map(a => {
            const className = classes.find(c => c.id === a.class_id)?.name || 'Class';
            return {
                id: a.id,
                title: a.title,
                subject: className,
                date: parseISO(a.due_date!),
                type: 'assignment' as const,
            }
        });
  }, [assignments, classes, isStudent]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach(event => {
      const dateString = format(event.date, 'yyyy-MM-dd');
      if (!map.has(dateString)) {
        map.set(dateString, []);
      }
      map.get(dateString)?.push(event);
    });
    return map;
  }, [events]);

  const selectedDayString = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '';
  const eventsForSelectedDay = eventsByDate.get(selectedDayString) || [];
  
  const eventDays = Array.from(eventsByDate.keys()).map(dateString => parseISO(dateString));
  
  if (isLoading && isStudent) {
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

  if (!isStudent) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12 text-center">
            <div className="flex flex-col items-center gap-2">
                <h3 className="text-2xl font-bold tracking-tight">
                Teacher Agenda Coming Soon
                </h3>
                <p className="text-sm text-muted-foreground">
                This view will show an aggregated calendar of all your class deadlines.
                </p>
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
                <CardContent className="p-0 sm:p-2">
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
                <CardContent className="space-y-4 min-h-[200px]">
                    {eventsForSelectedDay.length > 0 ? (
                        eventsForSelectedDay.map(event => (
                            <div key={event.id} className="p-3 bg-muted/50 rounded-lg border-l-4" style={{borderColor: `hsl(var(--${event.type === 'assignment' ? 'destructive' : 'primary'}))`}}>
                                <div className='flex justify-between items-start'>
                                  <div>
                                    <p className="font-semibold">{event.title}</p>
                                    <p className="text-sm text-muted-foreground">{event.subject}</p>
                                  </div>
                                  {event.type === 'assignment' ? <BookCheck className="h-4 w-4 text-destructive"/> : <BrainCircuit className="h-4 w-4 text-primary"/>}
                                </div>
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
