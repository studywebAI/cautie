export type ClassInfo = {
  id: string;
  name: string;
  studentCount: number;
  averageProgress: number;
  assignmentsDue: number;
  alerts: string[];
};

export type ClassIdea = {
  id: string;
  name: string;
  description: string;
}

export type Student = {
  id: string;
  name: string;
  avatarUrl?: string;
  overallProgress: number;
};

export type ClassAssignment = {
  id: string;
  title: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
};

export type MaterialReference = {
    id: string;
    title: string;
    type: 'Quiz' | 'Flashcards' | 'Reading';
}
