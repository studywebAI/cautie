'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
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
  BrainCircuit,
  Copy,
  FileSignature,
  School,
  Calendar,
} from 'lucide-react';

import { useDictionary } from '@/contexts/app-context';
import { RecentsSidebar } from './recents-sidebar';

export function AppSidebar() {
  const pathname = usePathname();
  const { dictionary } = useDictionary();

  const menuItems = [
    { href: '/', label: dictionary.sidebar.dashboard, icon: Home },
    { href: '/subjects', label: dictionary.sidebar.subjects, icon: BookOpen },
    { href: '/classes', label: dictionary.sidebar.classes, icon: School },
    { href: '/agenda', label: dictionary.sidebar.agenda, icon: Calendar },
    { href: '/material', label: dictionary.sidebar.tools.materialProcessor, icon: FileSignature },
  ];

  const toolsMenuItems = [
    { href: '/tools/quiz', label: dictionary.sidebar.tools.quizGenerator, icon: BrainCircuit },
    { href: '/tools/flashcards', label: dictionary.sidebar.tools.flashcardMaker, icon: Copy },
    { href: '/tools/notes', label: dictionary.sidebar.tools.notes, icon: FileSignature },
    { href: '/tools/blocks', label: 'Block Editor', icon: FileSignature },
  ];

  return (
    <Sidebar>
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

          {/* Tools section - direct listing */}
          {toolsMenuItems.map((item) => (
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
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 flex flex-col gap-4">
        <RecentsSidebar />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={dictionary.sidebar.settings}
              className="font-medium"
              isActive={pathname === '/settings'}
            >
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span>{dictionary.sidebar.settings}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}