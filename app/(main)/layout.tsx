"use client";

import { AppHeader } from "@/components/header";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background h-screen flex flex-col">
                <div className="p-4">
                    <SidebarTrigger />
                </div>
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
