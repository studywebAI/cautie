import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Home,
  Search,
  Bell
} from "lucide-react";

export function IconSidebar() {
  const icons = [
    { icon: Home, label: "Home" },
    { icon: BookOpen, label: "Subjects" },
    { icon: Users, label: "Classes" },
    { icon: FileText, label: "Assignments" },
    { icon: MessageSquare, label: "Messages" },
    { icon: Bell, label: "Notifications" },
    { icon: Search, label: "Search" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="w-12 bg-muted/50 border-r flex flex-col items-center py-4 space-y-2">
      {icons.map(({ icon: Icon, label }) => (
        <Button
          key={label}
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          title={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}