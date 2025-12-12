'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type TimelineEvent = {
  date: string;
  title: string;
  description: string;
  fullDescription?: string;
  wikipediaUrl?: string;
};

type TimelineData = {
  type: 'timeline';
  events: Array<{
    date: string;
    title: string;
    description: string;
  }>;
  topic?: string; // For Wikipedia fetching
};

type ProfessionalTimelineRendererProps = {
  data: TimelineData;
};

export function ProfessionalTimelineRenderer({ data }: ProfessionalTimelineRendererProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(data.events);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isLoadingWikipedia, setIsLoadingWikipedia] = useState(false);

  // Fetch additional data from Wikipedia if topic is provided
  useEffect(() => {
    if (data.topic && events.length === 0) {
      fetchWikipediaTimeline(data.topic);
    }
  }, [data.topic]);

  const fetchWikipediaTimeline = async (topic: string) => {
    setIsLoadingWikipedia(true);
    try {
      // This is a simplified example - in reality you'd need a Wikipedia API
      // For now, we'll simulate fetching data
      const mockEvents: TimelineEvent[] = [
        {
          date: '2020-01-01',
          title: 'Start of the Decade',
          description: 'The beginning of a new decade marked by significant global changes.',
          fullDescription: 'The 2020s began with the COVID-19 pandemic, which reshaped global health, economics, and social interactions worldwide.',
          wikipediaUrl: 'https://en.wikipedia.org/wiki/2020s'
        },
        {
          date: '2020-03-11',
          title: 'COVID-19 Pandemic Declared',
          description: 'WHO declares COVID-19 a global pandemic.',
          fullDescription: 'On March 11, 2020, the World Health Organization declared COVID-19 a pandemic, leading to unprecedented global health measures and economic impacts.',
          wikipediaUrl: 'https://en.wikipedia.org/wiki/COVID-19_pandemic'
        },
        {
          date: '2021-01-06',
          title: 'Capitol Riot',
          description: 'Attack on the United States Capitol building.',
          fullDescription: 'On January 6, 2021, supporters of then-President Donald Trump stormed the United States Capitol in an attempt to overturn the results of the 2020 presidential election.',
          wikipediaUrl: 'https://en.wikipedia.org/wiki/January_6_United_States_Capitol_attack'
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Failed to fetch Wikipedia data:', error);
    } finally {
      setIsLoadingWikipedia(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500"></div>

        {/* Events */}
        <div className="space-y-8">
          {sortedEvents.map((event, index) => (
            <div key={index} className="relative flex items-start">
              {/* Timeline dot */}
              <div className="absolute left-6 w-4 h-4 bg-white border-4 border-blue-500 rounded-full shadow-lg"></div>

              {/* Event card */}
              <div className="ml-16 w-full">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedEvent(event)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="text-sm font-medium">
                            {formatDate(event.date)}
                          </Badge>
                          {event.wikipediaUrl && (
                            <a
                              href={event.wikipediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              📖 Wikipedia
                            </a>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                      <div className="ml-4 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {isLoadingWikipedia && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Fetching timeline data from Wikipedia...</p>
          </div>
        )}

        {events.length === 0 && !isLoadingWikipedia && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Timeline Events</h3>
            <p className="text-gray-600">Add events to create a visual timeline of important dates and milestones.</p>
          </div>
        )}
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline">
                {selectedEvent && formatDate(selectedEvent.date)}
              </Badge>
              {selectedEvent?.wikipediaUrl && (
                <a
                  href={selectedEvent.wikipediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <span>📖</span> View on Wikipedia
                </a>
              )}
            </div>
            <DialogTitle className="text-2xl font-bold">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
              <p className="text-gray-700 leading-relaxed">
                {selectedEvent?.description}
              </p>
            </div>

            {selectedEvent?.fullDescription && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Detailed Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedEvent.fullDescription}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                Click outside to close • Press Escape to dismiss
              </div>
              {selectedEvent?.wikipediaUrl && (
                <a
                  href={selectedEvent.wikipediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Learn More on Wikipedia
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}