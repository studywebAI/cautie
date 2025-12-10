
'use client';

import { marked } from 'marked';
import { Card, CardContent } from '@/components/ui/card';

type NoteSection = {
  title: string;
  content: string | string[];
};

type NoteViewerProps = {
  notes: NoteSection[];
};

export function NoteViewer({ notes }: NoteViewerProps) {
  if (!notes || notes.length === 0) {
    return <p>No content available for this note.</p>;
  }

  return (
    <Card>
        <CardContent className="p-6">
            <div className="prose dark:prose-invert max-w-none">
                {notes.map((note, index) => (
                    <div key={index} className="mb-8">
                        <h2>{note.title}</h2>
                        <div dangerouslySetInnerHTML={{ __html: marked(Array.isArray(note.content) ? note.content.join('\n') : note.content) as string }} />
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}
