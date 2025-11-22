import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert as AlertUI, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Alert } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

const variantClasses = {
  destructive: "border-red-500/50 text-red-500 [&>svg]:text-red-500",
  warning: "border-orange-500/50 text-orange-500 [&>svg]:text-orange-500",
  info: "border-blue-500/50 text-blue-500 [&>svg]:text-blue-500",
  success: "border-green-500/50 text-green-500 [&>svg]:text-green-500",
};

const iconMap = {
    AlertTriangle,
    Info,
    CheckCircle2
}

type AlertsProps = {
    alerts: Alert[];
}

export function Alerts({ alerts }: AlertsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Important Alerts</CardTitle>
        <CardDescription>Risks and priorities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => {
            const Icon = iconMap[alert.icon as keyof typeof iconMap] || AlertTriangle;
            return (
              <AlertUI key={alert.id} className={cn(variantClasses[alert.variant])}>
                <Icon className="h-4 w-4" />
                <AlertTitle className="font-semibold">{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </AlertUI>
            );
        })}
      </CardContent>
    </Card>
  );
}
