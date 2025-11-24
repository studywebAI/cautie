
'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, BookCheck, Lightbulb } from 'lucide-react';
import type { CalendarEvent } from '@/app/(main)/agenda/page';
import type { AiSuggestion } from '@/lib/types';
import { useDictionary } from '@/contexts/dictionary-context';
import { Button } from '../ui/button';

type TodayPanelProps = {
  selectedDay?: Date;
  events: CalendarEvent[];
  suggestion: AiSuggestion | null;
};

const iconMap = {
  BrainCircuit,
  FileText: BookCheck, // Mapping for consistency
  Calendar: BookCheck,
};


export function TodayPanel({ selectedDay, events, suggestion }: TodayPanelProps) {
  const { dictionary } = useDictionary();

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
                    events.map(event => (
                        <div key={event.id} className="p-3 bg-muted/50 rounded-lg border-l-4" 
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
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        {dictionary.agenda.noEvents}
                    </p>
                )}
            </CardContent>
        </Card>
        
        {suggestion && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        AI Smart Suggestion
                    </CardTitle>
                </CardHeader>
                 <CardContent>
                     <Button
                        variant="outline"
                        className="w-full justify-start h-auto p-3 text-left bg-background hover:bg-muted"
                        >
                        <BrainCircuit className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                        <span className="flex-1 whitespace-normal">{suggestion.title}</span>
                    </Button>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
