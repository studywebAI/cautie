export type ClassInfo = {
  id: string;
  name: string;
  studentCount: number;
  averageProgress: number;
  assignmentsDue: number;
  alerts: string[];
};

// These are placeholders for now and will be expanded later.
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
