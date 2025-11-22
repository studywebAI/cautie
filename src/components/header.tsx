"use client";

import { useContext } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AppContext, AppContextType } from '@/contexts/app-context';
import { BookUser, User } from 'lucide-react';


export function AppHeader() {
  const { role, setRole } = useContext(AppContext) as AppContextType;
  const isStudent = role === 'student';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-xl font-semibold font-headline">
          { isStudent ? 'Anonymous' : 'Teacher Dashboard'}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <User className={`h-5 w-5 transition-colors ${isStudent ? 'text-primary' : 'text-muted-foreground'}`} />
            <Label htmlFor="role-switcher" className="sr-only">Role Switcher</Label>
            <Switch
                id="role-switcher"
                checked={!isStudent}
                onCheckedChange={(checked) => setRole(checked ? 'teacher' : 'student')}
            />
            <BookUser className={`h-5 w-5 transition-colors ${!isStudent ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </div>
    </header>
  );
}
