import { z } from 'zod';

export type Task = {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
};

export type Alert = {
  id: string;
  title: string;
  description: string;
  variant: "destructive" | "warning" | "info" | "success";
  icon: "AlertTriangle" | "Info" | "CheckCircle2";
};

export type Deadline = {
  id: string;
  subject: string;
  title: string;
  date: string;
  workload: string;
  status: "on-track" | "risk" | "behind";
};

export type Subject = {
  id: string;
  name: string;
  progress: number;
};

export type AiSuggestion = {
  id:string;
  title: string;
  icon: "BrainCircuit" | "FileText" | "Calendar";
};

export type QuickAccessItem = {
  id: string;
  title: string;
  type: "summary" | "quiz" | "file" | "notes";
  icon: "Notebook" | "File" | "BrainCircuit" | "FileText";
};

export type ProgressData = {
  day: string;
  'Study Time': number;
};

// Types for process-material flow
export type SuggestedAction = {
  id: 'create-a-summary' | 'generate-a-quiz' | 'make-flashcards';
  label: string;
  description: string;
  icon: 'FileText' | 'BrainCircuit' | 'BookCopy';
}

export type MaterialAnalysis = {
    title: string;
    topic: string;
    summary: string;
    sourceText: string;
}

export type ProcessMaterialResult = {
    analysis: MaterialAnalysis;
    suggestedActions: SuggestedAction[];
}

// Types for generate-quiz flow
export const QuizOptionSchema = z.object({
  id: z.string().describe('Unique identifier for the option (e.g., "a", "b", "c").'),
  text: z.string().describe('The text of the answer option.'),
  isCorrect: z.boolean().describe('Whether this option is the correct answer.'),
});

export const QuizQuestionSchema = z.object({
  id: z.string().describe('Unique identifier for the question.'),
  question: z.string().describe('The text of the question.'),
  options: z.array(QuizOptionSchema).describe('An array of 3 to 4 possible answer options.'),
});

export const QuizSchema = z.object({
  title: z.string().describe('A suitable title for the quiz, based on the source text.'),
  description: z.string().describe('A brief description of the quiz content.'),
  questions: z.array(QuizQuestionSchema).describe('An array of questions.'),
});

export type QuizOption = z.infer<typeof QuizOptionSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;


export type SessionRecapData = {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
};
