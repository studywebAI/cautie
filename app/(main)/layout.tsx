"use client";

import { AppHeader } from "@/components/header";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-muted/40">
                <AppHeader />
                <div className="flex-1 p-4 lg:p-6">
                  {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
