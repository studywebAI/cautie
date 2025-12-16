"use client";

import { AppHeader } from "@/components/header";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarToggle } from "@/components/sidebar-toggle";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarToggle />
            <SidebarInset className="bg-background h-screen flex flex-col">
                <AppHeader />
                <div className="flex-1 overflow-hidden">
                  <div className="h-full">
                    {children}
                  </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
