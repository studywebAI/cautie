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
  imageUrl: string;
  imageHint: string;
};

export type AiSuggestion = {
  id: string;
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
