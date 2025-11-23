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
export type QuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
};

export type Quiz = {
  title: string;
  description: string;
  questions: QuizQuestion[];
};

export type SessionRecapData = {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
};
