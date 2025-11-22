import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AiSuggestion } from "@/lib/types";
import { BrainCircuit, FileText, Calendar } from "lucide-react";

const iconMap = {
  BrainCircuit,
  FileText,
  Calendar,
};

type AiSuggestionsProps = {
  aiSuggestions: AiSuggestion[];
};

export function AiSuggestions({ aiSuggestions }: AiSuggestionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">AI Suggesties</CardTitle>
        <CardDescription>Je persoonlijke assistent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {aiSuggestions.map((suggestion) => {
          const Icon = iconMap[suggestion.icon as keyof typeof iconMap] || BrainCircuit;
          return (
            <Button
              key={suggestion.id}
              variant="outline"
              className="w-full justify-start h-auto p-3 text-left bg-background hover:bg-muted"
            >
              <Icon className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
              <span className="flex-1 whitespace-normal">{suggestion.title}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
