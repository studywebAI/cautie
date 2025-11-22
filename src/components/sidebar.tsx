"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  Calendar,
  Home,
  Settings,
  BarChart3,
  GraduationCap,
  Folder,
  MessageSquareQuote,
} from "lucide-react";

const menuItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  // { href: "/calendar", label: "Calendar", icon: Calendar },
  // { href: "/stats", "label": "Statistics", "icon": BarChart3 },
  { href: "/material", label: "Material", icon: Folder },
  { href: "/qa", label: "Q&A", icon: MessageSquareQuote },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
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
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 flex flex-col gap-4">
         <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton asChild tooltip="Settings" className="font-medium" isActive={pathname === '/settings'}>
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
