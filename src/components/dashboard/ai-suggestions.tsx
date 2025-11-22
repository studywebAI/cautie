import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { aiSuggestions } from "@/lib/mock-data";

export function AiSuggestions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">AI Suggesties</CardTitle>
        <CardDescription>Je persoonlijke assistent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {aiSuggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            variant="outline"
            className="w-full justify-start h-auto p-3 text-left bg-background hover:bg-muted"
          >
            <suggestion.icon className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
            <span className="flex-1 whitespace-normal">{suggestion.title}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
