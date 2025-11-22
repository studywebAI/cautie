'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Copy, FileSignature, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const tools = [
  {
    title: 'AI Quiz Generator',
    description: 'Create multiple-choice quizzes from any text. Test your knowledge with various challenging modes.',
    icon: BrainCircuit,
    href: '/tools/quiz',
  },
  {
    title: 'AI Flashcard Maker',
    description: 'Automatically generate flashcards from your study materials to reinforce key concepts.',
    icon: Copy,
    href: '/tools/flashcards',
  },
    {
    title: 'AI Summary Tool',
    description: 'Get a concise summary of any uploaded document or pasted text to quickly grasp the main points.',
    icon: FileSignature,
    href: '/tools/summary',
  }
];

export default function ToolsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">AI-Powered Tools</h1>
        <p className="text-muted-foreground">
          Your suite of intelligent tools to accelerate learning.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
            const Icon = tool.icon;
            return (
                 <Card key={tool.title} className="flex flex-col group hover:border-primary transition-all">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                             <CardTitle className="font-headline text-xl">{tool.title}</CardTitle>
                             <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                                <Icon className="h-6 w-6" />
                             </div>
                        </div>
                        <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow"></CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href={tool.href}>
                                Select Tool
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            )
        })}
      </div>
    </div>
  );
}
