'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BookCheck, BrainCircuit } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types';

interface DraggableEventProps {
  event: CalendarEvent;
}

export function DraggableEvent({ event }: DraggableEventProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-1.5 rounded text-xs cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : 'hover:bg-muted/50'
      } ${
        event.type === 'assignment' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
      }`}
    >
      <div className="font-medium truncate">{event.title}</div>
      <div className="text-muted-foreground truncate">{event.subject}</div>
      {event.chapter_title && (
        <div className="text-muted-foreground/70 truncate text-[10px] flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-current rounded-full"></span>
          {event.chapter_title}
        </div>
      )}
    </div>
  );
}