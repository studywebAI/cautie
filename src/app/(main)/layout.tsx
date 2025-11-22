import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { AppHeader } from "@/components/header";
import { AppProvider } from "@/contexts/app-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col flex-1 !min-h-screen">
              <AppHeader />
              <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-muted/30">
                {children}
              </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AppProvider>
  );
}
