'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleSidebar}
      className="fixed top-1/2 left-0 z-50 h-12 w-6 rounded-l-none rounded-r-full border-l-0 bg-background shadow-md hover:bg-accent"
    >
      {state === 'expanded' ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </Button>
  );
}