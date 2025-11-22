'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  BookOpen,
  Home,
  Settings,
  Folder,
  MessageSquareQuote,
  BrainCircuit,
  Copy,
  FileText,
  ChevronDown,
  Wrench,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/material', label: 'Material', icon: FileText },
];

const toolsMenuItems = [
  { href: '/tools/questions', label: 'Questions', icon: MessageSquareQuote },
  { href: '/tools/quiz', label: 'Quiz', icon: BrainCircuit },
  { href: '/tools/flashcards', label: 'Flashcards', icon: Copy },
]

export function AppSidebar() {
  const pathname = usePathname();
  const isToolsActive = pathname.startsWith('/tools');

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold font-headline text-primary">
            StudyWeb
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4 flex-1">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className="font-medium"
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <Collapsible defaultOpen={isToolsActive}>
             <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 p-2 font-medium text-sm h-auto data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <Folder className="h-5 w-5" />
                    <span>Tools</span>
                    <ChevronDown className="h-4 w-4 ml-auto transition-transform data-[state=open]:rotate-180" />
                </Button>
             </CollapsibleTrigger>
             <CollapsibleContent>
                <div className="pl-7 pt-2 flex flex-col gap-1">
                    {toolsMenuItems.map((item) => (
                         <SidebarMenuButton
                            key={item.label}
                            asChild
                            isActive={pathname === item.href}
                            tooltip={item.label}
                            className="font-medium h-9"
                        >
                            <Link href={item.href}>
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    ))}
                </div>
             </CollapsibleContent>
          </Collapsible>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 flex flex-col gap-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              className="font-medium"
              isActive={pathname === '/settings'}
            >
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
