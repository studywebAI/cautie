"use client";

import { AppHeader } from "@/components/header";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function AppLayout({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();

    return (
        <>
            <AppSidebar />
            <div className={cn(
                "flex flex-col transition-[margin-left] duration-300 ease-in-out",
                state === 'expanded' ? "md:ml-[220px] lg:ml-[280px]" : "md:ml-[5rem]"
            )}>
                <AppHeader />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 bg-muted/40 min-h-screen">
                    {children}
                </main>
            </div>
        </>
    );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppLayout>{children}</AppLayout>
        </SidebarProvider>
    );
}
