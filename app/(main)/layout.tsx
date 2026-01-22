"use client";

import { AppHeader } from "@/components/header";
import { AppSidebar } from "@/components/sidebar";
import { IconSidebar } from "@/components/icon-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <IconSidebar />
            <SidebarInset className="bg-background h-screen flex flex-col">
                <AppHeader />
                <div className="flex-1 overflow-auto">
                  <div className="min-h-full">
                    {children}
                  </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
