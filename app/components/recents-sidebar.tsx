'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BrainCircuit,
  Copy,
  FileSignature,
  Trash2,
  Edit3,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type RecentItem = {
  id: string;
  title: string;
  type: 'flashcards' | 'notes' | 'quiz' | 'mindmap';
  createdAt: Date;
  updatedAt: Date;
};

const TYPE_ICONS = {
  flashcards: Copy,
  notes: FileSignature,
  quiz: BrainCircuit,
  mindmap: BrainCircuit,
};

const TYPE_LABELS = {
  flashcards: 'Flashcards',
  notes: 'Notes',
  quiz: 'Quiz',
  mindmap: 'Mind Map',
};

export function RecentsSidebar() {
  const [recents, setRecents] = useState<RecentItem[]>([]);

  // Load recents from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cautie_recents');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const withDates = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        setRecents(withDates);
      } catch (error) {
        console.error('Failed to parse recents from localStorage:', error);
      }
    }
  }, []);

  // Save recents to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cautie_recents', JSON.stringify(recents));
  }, [recents]);

  const addRecent = (item: Omit<RecentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: RecentItem = {
      ...item,
      id: `recent-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setRecents(prev => [newItem, ...prev.slice(0, 9)]); // Keep only 10 most recent
  };

  const updateRecent = (id: string, updates: Partial<RecentItem>) => {
    setRecents(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date() }
          : item
      )
    );
  };

  const deleteRecent = (id: string) => {
    setRecents(prev => prev.filter(item => item.id !== id));
  };

  const renameRecent = (id: string, newTitle: string) => {
    updateRecent(id, { title: newTitle });
  };

  // Expose functions globally for other components to use
  useEffect(() => {
    (window as any).recentsManager = {
      addRecent,
      updateRecent,
      deleteRecent,
      renameRecent,
    };

    return () => {
      delete (window as any).recentsManager;
    };
  }, []);

  if (recents.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Creations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent creations yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Creations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recents.map((item) => {
          const Icon = TYPE_ICONS[item.type];

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={item.title}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {TYPE_LABELS[item.type]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(item.updatedAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    const newTitle = prompt('Rename item:', item.title);
                    if (newTitle && newTitle.trim()) {
                      renameRecent(item.id, newTitle.trim());
                    }
                  }}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  onClick={() => deleteRecent(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}