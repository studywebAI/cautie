import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { AppHeader } from "@/components/header";
import { AppProvider } from "@/contexts/app-context";
import { DictionaryProvider } from "@/contexts/dictionary-context";
import type { Database } from "@/lib/supabase/database.types";
import type { CookieOptions } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  const { data: { session } } = await supabase.auth.getSession();

  // The AppProvider will handle the null session for guest users.
  // No redirect is performed here.

  return (
    <AppProvider session={session}>
      <DictionaryProvider>
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
      </DictionaryProvider>
    </AppProvider>
  );
}
