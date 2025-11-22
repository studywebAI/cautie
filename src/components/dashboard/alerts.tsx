import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert as AlertUI, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { alerts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const variantClasses = {
  destructive: "border-red-500/50 text-red-500 [&>svg]:text-red-500",
  warning: "border-orange-500/50 text-orange-500 [&>svg]:text-orange-500",
  info: "border-blue-500/50 text-blue-500 [&>svg]:text-blue-500",
  success: "border-green-500/50 text-green-500 [&>svg]:text-green-500",
};

export function Alerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Belangrijke waarschuwingen</CardTitle>
        <CardDescription>Risico's en prioriteiten</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <AlertUI key={alert.id} className={cn(variantClasses[alert.variant])}>
            <alert.icon className="h-4 w-4" />
            <AlertTitle className="font-semibold">{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </AlertUI>
        ))}
      </CardContent>
    </Card>
  );
}
