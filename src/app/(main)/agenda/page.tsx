
'use client';

import { useState, useContext, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { AppContext, AppContextType, PersonalTask, ClassAssignment } from '@/contexts/app-context';
import { useDictionary } from '@/contexts/dictionary-context';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from '@/components/agenda/create-task-dialog';
import { TodayPanel } from '@/components/agenda/today-panel';
import { PlusCircle } from 'lucide-react';
import type { AiSuggestion } from '@/lib/types';
import Link from 'next/link';


export type CalendarEvent = {
  id: string;
  title: string;
  subject: string;
  date: Date;
  type: 'assignment' | 'study_plan' | 'personal';
  href: string;
};

export default function AgendaPage() {
  const { assignments, classes, isLoading, role, personalTasks, createPersonalTask } = useContext(AppContext) as AppContextType;
  const { dictionary } = useDictionary();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  
  const isStudent = role === 'student';

  const events: CalendarEvent[] = useMemo(() => {
    if (!isStudent) return [];
    
    const assignmentEvents = (assignments || [])
        .filter((a: ClassAssignment) => a.due_date)
        .map((a: ClassAssignment) => {
            const className = classes.find(c => c.id === a.class_id)?.name || 'Class';
            const href = a.material_id ? `/material/${a.material_id}` : `/class/${a.class_id}`;
            return {
                id: a.id,
                title: a.title,
                subject: className,
                date: parseISO(a.due_date!),
                type: 'assignment' as const,
                href: href,
            }
        });

    const personalEvents = personalTasks.map((t: PersonalTask) => ({
        id: t.id,
        title: t.title,
        subject: t.subject || 'Personal',
        date: parseISO(t.date),
        type: 'personal' as const,
        href: `/agenda#${t.id}` // Not a real page, but a unique link
    }));
    
    return [...assignmentEvents, ...personalEvents];
  }, [assignments, classes, isStudent, personalTasks]);

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
  
  const todaySuggestion: AiSuggestion | null = null; // Placeholder for AI suggestions

  const handleTaskCreated = async (newTask: Omit<PersonalTask, 'id' | 'created_at' | 'user_id'>) => {
    await createPersonalTask(newTask);
  };
  
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
    <>
    <div className="flex flex-col gap-8 h-full">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold font-headline">{dictionary.agenda.title}</h1>
            <p className="text-muted-foreground">{dictionary.agenda.description}</p>
        </div>
        <Button onClick={() => setIsCreateTaskOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {dictionary.agenda.addTask}
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start flex-1">
        <div className="md:col-span-8 lg:col-span-9">
            <Card>
                <CardContent className="p-0 sm:p-2">
                    <Calendar
                        mode="single"
                        selected={selectedDay}
                        onSelect={setSelectedDay}
                        className="w-full"
                        modifiers={{ 
                            event: eventDays,
                            today: new Date(),
                        }}
                        modifiersClassNames={{
                            event: 'border-2 border-primary/50 rounded-full',
                            today: 'bg-accent/20 text-accent-foreground',
                        }}
                    />
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-4 lg:col-span-3">
           <TodayPanel 
                selectedDay={selectedDay}
                events={eventsForSelectedDay}
                suggestion={todaySuggestion}
           />
        </div>

      </div>
    </div>
    <CreateTaskDialog 
        isOpen={isCreateTaskOpen}
        setIsOpen={setIsCreateTaskOpen}
        onTaskCreated={handleTaskCreated}
        initialDate={selectedDay}
    />
    </>
  );
}
