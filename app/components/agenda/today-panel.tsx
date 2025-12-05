
'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, BookCheck, Lightbulb, Loader2 } from 'lucide-react'; // Added Loader2
import type { CalendarEvent } from '@/app/(main)/agenda/page';
import type { AiSuggestion } from '@/lib/types';
import { useDictionary } from '@/contexts/app-context';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton'; // Added Skeleton

type TodayPanelProps = {
  selectedDay?: Date;
  events: CalendarEvent[];
  suggestion: AiSuggestion | null;
  isGeneratingSuggestion: boolean; // Added isGeneratingSuggestion
};

const iconMap = {
  BrainCircuit,
  FileText: BookCheck, // Mapping for consistency
  Calendar: BookCheck,
};


export function TodayPanel({ selectedDay, events, suggestion, isGeneratingSuggestion }: TodayPanelProps) { // Destructured isGeneratingSuggestion
  const { dictionary } = useDictionary();

  const renderEvent = (event: CalendarEvent) => {
    const content = (
         <div className="p-3 bg-muted/50 rounded-lg border-l-4" 
              style={{borderColor: `hsl(var(--${event.type === 'assignment' ? 'destructive' : 'primary'}))`}}>
            <div className='flex justify-between items-start'>
              <div>
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.subject}</p>
              </div>
              {event.type === 'assignment' 
                ? <BookCheck className="h-4 w-4 text-destructive"/> 
                : <BrainCircuit className="h-4 w-4 text-primary"/>}
            </div>
        </div>
    );
    
    if (event.type === 'assignment') {
        return (
            <Link key={event.id} href={event.href} className="block group hover:bg-muted transition-colors rounded-lg">
                {content}
            </Link>
        )
    }

    return <div key={event.id}>{content}</div>
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">
                    {dictionary.agenda.eventsOn} {selectedDay ? format(selectedDay, 'MMMM d') : 'the selected day'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 min-h-[200px]">
                {events.length > 0 ? (
                    events.map(renderEvent)
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        {dictionary.agenda.noEvents}
                    </p>
                )}
            </CardContent>
        </Card>
        
        {(isGeneratingSuggestion || suggestion) && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        AI Smart Suggestion
                    </CardTitle>
                </CardHeader>
                 <CardContent>
                    {isGeneratingSuggestion ? (
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto p-3 text-left bg-background hover:bg-muted"
                        >
                            <BrainCircuit className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                            <span className="flex-1 whitespace-normal">{suggestion?.title}</span>
                        </Button>
                    )}
                    {suggestion?.content && !isGeneratingSuggestion && (
                        <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                            {suggestion.content}
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
    </div>
  );
}
