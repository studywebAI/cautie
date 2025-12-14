"use client";

import { useContext } from 'react';
import Link from 'next/link';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AppContext, AppContextType, useDictionary } from '@/contexts/app-context';
import { BookUser, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


export function AppHeader() {
  const { role, setRole, session } = useContext(AppContext) as AppContextType;
  const { dictionary } = useDictionary();
  const isStudent = role === 'student';

  const userEmail = session?.user?.email;
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';

  const handleLogout = async () => {
    const response = await fetch('/auth/logout', { method: 'POST' });
    if (response.ok) {
        window.location.href = '/login';
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger/>
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">C</span>
        </div>
        <span className="font-bold text-lg hidden sm:block">Cautie</span>
      </div>
      <div className="flex-1">
        <h1 className="text-xl font-semibold font-headline">
          { isStudent ? dictionary.header.studentDashboard : dictionary.header.teacherDashboard}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {session ? (
            <>
                <div className="flex items-center justify-between p-2 rounded-md">
                    <Label htmlFor="role-switcher" className="flex items-center gap-2 cursor-pointer pr-3">
                      <User className={`h-5 w-5 transition-colors ${isStudent ? 'text-primary' : 'text-muted-foreground'}`} />
                    </Label>
                    <Switch
                        id="role-switcher"
                        checked={!isStudent}
                        onCheckedChange={(checked) => setRole(checked ? 'teacher' : 'student')}
                        aria-label="Toggle between student and teacher view"
                    />
                    <Label htmlFor="role-switcher" className="flex items-center gap-2 cursor-pointer pl-3">
                      <BookUser className={`h-5 w-5 transition-colors ${!isStudent ? 'text-primary' : 'text-muted-foreground'}`} />
                    </Label>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>{userInitial}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className='font-normal'>
                            <div className='flex flex-col space-y-1'>
                                <p className='text-sm font-medium leading-none'>My Account</p>
                                <p className='text-xs leading-none text-muted-foreground'>{userEmail}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        ) : (
             <Button asChild>
                <Link href="/login">Log In</Link>
            </Button>
        )}

      </div>
    </header>
  );
}
