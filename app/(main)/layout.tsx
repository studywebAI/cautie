"use client";

import { AppHeader } from "@/components/header";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function AppLayout({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();

    return (
        <div className={cn(
            "grid min-h-screen w-full",
            state === 'expanded' ? "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]" : "md:grid-cols-[5rem_1fr] lg:grid-cols-[5rem_1fr]"
        )}>
            <AppSidebar />
            <div className="flex flex-col">
                <AppHeader />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppLayout>{children}</AppLayout>
        </SidebarProvider>
    );
}
