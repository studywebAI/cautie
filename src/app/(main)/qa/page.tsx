'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateInitialAnswer } from '@/ai/flows/generate-initial-answer';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function QAPage() {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const { toast } = useToast();

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        variant: 'destructive',
        title: 'Question is empty',
        description: 'Please enter a question before asking the AI.',
      });
      return;
    }
    setIsLoading(true);
    setAnswer('');
    try {
      const response = await generateInitialAnswer({
        question,
        context,
      });
      setAnswer(response.answer);
    } catch (error) {
      console.error('Error generating answer:', error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'The AI could not generate an answer. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Q&A System</h1>
        <p className="text-muted-foreground">
          Ask a question and get an initial answer from the AI. A teacher can verify it later.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Ask a New Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type your question here..."
            className="h-24 resize-none"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Input
            placeholder="Optional: Provide some context (e.g., subject, chapter)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleAskQuestion} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating Answer...' : 'Ask AI'}
          </Button>
        </CardFooter>
      </Card>

      { (isLoading || answer) && (
        <Card>
          <CardHeader>
            <CardTitle>AI Generated Answer</CardTitle>
            <CardDescription>
              This is a preliminary answer. Awaiting teacher verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-9 w-9 border">
                 <AvatarFallback className="bg-primary text-primary-foreground">
                    <Sparkles className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="pt-1.5 prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                 {isLoading && !answer && <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>}
                {answer}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
