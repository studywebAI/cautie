"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-xl font-semibold font-headline">
          Anonymous
        </h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        {/* Empty div for any future right-aligned content */}
      </div>
    </header>
  );
}
