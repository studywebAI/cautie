
'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { AppContext, AppContextType, PersonalTask, ClassAssignment, ClassInfo, useDictionary } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from '@/components/agenda/create-task-dialog';
import { TodayPanel } from '@/components/agenda/today-panel';
import { PlusCircle, BookCheck } from 'lucide-react';
import type { AiSuggestion } from '@/lib/types';
import Link from 'next/link';
// import { generatePersonalizedStudyPlan } from '@/ai/flows/generate-personalized-study-plan'; // Removed direct import
import { useToast } from '@/hooks/use-toast';


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
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const { toast } = useToast();

  const isStudent = role === 'student';

  const events: CalendarEvent[] = useMemo(() => {
    if (isLoading) return [];

    let allEvents: CalendarEvent[] = [];

    if (isStudent) {
      const studentAssignmentEvents = (assignments || [])
        .filter((a: ClassAssignment) => a.due_date)
        .map((a: ClassAssignment) => {
            const className = (classes || []).find((c: ClassInfo) => c.id === a.class_id)?.name || 'Class';
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

      const personalEvents = (personalTasks || []).map((t: PersonalTask) => ({
          id: t.id,
          title: t.title,
          subject: t.subject || 'Personal',
          date: parseISO(t.date),
          type: 'personal' as const,
          href: `/agenda#${t.id}`
      }));

      allEvents = [...studentAssignmentEvents, ...personalEvents];
    } else { // Teacher view
        const teacherAssignmentEvents = (assignments || [])
            .filter((a: ClassAssignment) => a.due_date && (classes || []).some((c: ClassInfo) => c.id === a.class_id)) 
            .map((a: ClassAssignment) => {
                const className = (classes || []).find((c: ClassInfo) => c.id === a.class_id)?.name || 'Class';
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
        allEvents = [...teacherAssignmentEvents];
    }
    
    return allEvents;
  }, [assignments, classes, isStudent, personalTasks, isLoading]);

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
  
  useEffect(() => {
    if (!selectedDay || !isStudent || !eventsForSelectedDay.length) {
      setAiSuggestion(null);
      return;
    }

    const generateSuggestion = async () => {
      setIsGeneratingSuggestion(true);
      setAiSuggestion(null);

      const relevantEvents = eventsForSelectedDay.filter(event => event.type === 'assignment' || event.type === 'personal');
      const tasksForAI = relevantEvents.map(event => `Title: ${event.title}, Due: ${format(event.date, 'PPP')}, Type: ${event.type}`).join("\n");

      if (!tasksForAI) {
        setIsGeneratingSuggestion(false);
        return;
      }

      try {
        const response = await fetch('/api/ai/handle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                flowName: 'generatePersonalizedStudyPlan',
                input: {
                    deadlines: tasksForAI,
                    learningHabits: "The student prefers to study in the evenings and focuses on one subject at a time.",
                    calendar: "The student's calendar includes classes from 9 AM to 3 PM on weekdays, and weekends are free.",
                },
            }),
        });
        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                if (errorData.detail) errorMessage = errorData.detail;
                if (errorData.code === "MISSING_API_KEY") {
                    errorMessage = "AI is not configured (Missing API Key). Please check server logs.";
                }
            } catch (e) { /* ignore */ }
            throw new Error(errorMessage);
        }
        const result = await response.json();
        setAiSuggestion({ id: 'ai-plan', title: result.studyPlan, content: result.studyPlan, icon: 'BrainCircuit' });
      } catch (error) {
        console.error("Failed to generate study plan suggestion:", error);
        toast({
          variant: "destructive",
          title: "AI Suggestion Failed",
          description: "Could not generate a study plan. Please try again later.",
        });
      } finally {
        setIsGeneratingSuggestion(false);
      }
    };

    generateSuggestion();
  }, [selectedDay, isStudent, eventsForSelectedDay, toast, assignments, classes, personalTasks]);


  const handleTaskCreated = async (newTask: Omit<PersonalTask, 'id' | 'created_at' | 'user_id'>) => {
    await createPersonalTask(newTask);
  };
  
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
    <>
    <div className="flex flex-col gap-8 h-full">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold font-headline">{dictionary.agenda.title}</h1>
            <p className="text-muted-foreground">{dictionary.agenda.description}</p>
        </div>
        {isStudent && (
          <Button onClick={() => setIsCreateTaskOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {dictionary.agenda.addTask}
          </Button>
        )}
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
           {isStudent && (
             <TodayPanel 
                selectedDay={selectedDay}
                events={eventsForSelectedDay}
                suggestion={aiSuggestion}
                isGeneratingSuggestion={isGeneratingSuggestion}
             />
           )}
           {!isStudent && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Upcoming Deadlines</CardTitle>
                        <CardDescription>All assignments due soon across your classes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 min-h-[200px]">
                        {eventsForSelectedDay.length > 0 ? (
                            eventsForSelectedDay.map(event => (
                                <Link key={event.id} href={event.href} className="block group hover:bg-muted transition-colors rounded-lg">
                                    <div className="p-3 bg-muted/50 rounded-lg border-l-4" 
                                         style={{borderColor: `hsl(var(--destructive))`}}>
                                        <div className='flex justify-between items-start'>
                                            <div>
                                                <p className="font-semibold">{event.title}</p>
                                                <p className="text-sm text-muted-foreground">{event.subject}</p>
                                            </div>
                                            <BookCheck className="h-4 w-4 text-destructive"/> 
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No assignments due on this day.
                            </p>
                        )}
                    </CardContent>
                </Card>
           )}
        </div>

      </div>
    </div>
    {isStudent && (
        <CreateTaskDialog 
            isOpen={isCreateTaskOpen}
            setIsOpen={setIsCreateTaskOpen}
            onTaskCreated={handleTaskCreated}
            initialDate={selectedDay}
        />
    )}
    </>
  );
}
