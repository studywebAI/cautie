'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { generateDashboardData as generateStudentDashboardData, GenerateDashboardDataOutput as StudentDashboardData } from '@/ai/flows/generate-dashboard-data';
import { generateTeacherDashboardData, GenerateTeacherDashboardDataOutput as TeacherDashboardData } from '@/ai/flows/generate-teacher-dashboard-data';

export type UserRole = 'student' | 'teacher';

export type AppContextType = {
  studentDashboardData: StudentDashboardData | null;
  teacherDashboardData: TeacherDashboardData | null;
  isLoading: boolean;
  language: string;
  setLanguage: (language: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [studentDashboardData, setStudentDashboardData] = useState<StudentDashboardData | null>(null);
  const [teacherDashboardData, setTeacherDashboardData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState('en');
  const [role, setRoleState] = useState<UserRole>('student');

  const loadStudentData = useCallback(async () => {
    if (studentDashboardData) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await generateStudentDashboardData({
        studentName: "Alex Jansen",
        subjects: ["History", "Math", "Science", "Literature", "Art", "Geography", "Dutch"],
      });
      setStudentDashboardData(data);
    } catch (error) {
      console.error("Failed to load student dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [studentDashboardData]);

  const loadTeacherData = useCallback(async () => {
    if (teacherDashboardData) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await generateTeacherDashboardData({
        teacherName: 'Mr. Davison',
        classNames: ['History - Grade 10', 'Modern Art History', 'Geography - Grade 11', 'World History - AP'],
      });
      setTeacherDashboardData(data);
    } catch (error) {
      console.error("Failed to load teacher dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [teacherDashboardData]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('studyweb-language');
    if (savedLanguage) setLanguageState(savedLanguage);

    const savedRole = localStorage.getItem('studyweb-role');
    const initialRole = savedRole === 'teacher' ? 'teacher' : 'student';
    setRoleState(initialRole);

    if (initialRole === 'student') {
      loadStudentData();
    } else {
      loadTeacherData();
    }
  }, [loadStudentData, loadTeacherData]);
  
  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem('studyweb-language', newLanguage);
  };
  
  const setRole = (newRole: UserRole) => {
    if (newRole === role) return;
    
    setRoleState(newRole);
    localStorage.setItem('studyweb-role', newRole);

    if (newRole === 'student') {
      loadStudentData();
    } else {
      loadTeacherData();
    }
  };

  const dashboardData = role === 'student' ? studentDashboardData : null;
  const currentTeacherData = role === 'teacher' ? teacherDashboardData : null;

  return (
    <AppContext.Provider value={{ studentDashboardData: dashboardData, teacherDashboardData: currentTeacherData, isLoading, language, setLanguage, role, setRole }}>
      {children}
    </AppContext.Provider>
  );
};
