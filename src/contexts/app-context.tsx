'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { generateDashboardData as generateStudentDashboardData, GenerateDashboardDataOutput as StudentDashboardData } from '@/ai/flows/generate-dashboard-data';
import { generateTeacherDashboardData, GenerateTeacherDashboardDataOutput as TeacherDashboardData } from '@/ai/flows/generate-teacher-dashboard-data';
import type { SessionRecapData } from '@/lib/types';

export type UserRole = 'student' | 'teacher';

export type AppContextType = {
  studentDashboardData: StudentDashboardData | null;
  teacherDashboardData: TeacherDashboardData | null;
  isLoading: boolean;
  // Language
  language: string;
  setLanguage: (language: string) => void;
  // Role
  role: UserRole;
  setRole: (role: UserRole) => void;
  // Accessibility
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  dyslexiaFont: boolean;
  setDyslexiaFont: (enabled: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  // Session Analytics
  sessionRecap: SessionRecapData | null;
  setSessionRecap: (data: SessionRecapData | null) => void;
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [studentDashboardData, setStudentDashboardData] = useState<StudentDashboardData | null>(null);
  const [teacherDashboardData, setTeacherDashboardData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings States
  const [language, setLanguageState] = useState('en');
  const [role, setRoleState] = useState<UserRole>('student');
  const [highContrast, setHighContrastState] = useState(false);
  const [dyslexiaFont, setDyslexiaFontState] = useState(false);
  const [reducedMotion, setReducedMotionState] = useState(false);

  // Analytics State
  const [sessionRecap, setSessionRecap] = useState<SessionRecapData | null>(null);

  // Effect for INITIAL settings load from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('studyweb-language') || 'en';
    setLanguageState(savedLanguage);

    const savedRole = localStorage.getItem('studyweb-role') as UserRole || 'student';
    setRoleState(savedRole);

    const savedHighContrast = localStorage.getItem('studyweb-high-contrast') === 'true';
    setHighContrastState(savedHighContrast);

    const savedDyslexiaFont = localStorage.getItem('studyweb-dyslexia-font') === 'true';
    setDyslexiaFontState(savedDyslexiaFont);

    const savedReducedMotion = localStorage.getItem('studyweb-reduced-motion') === 'true';
    setReducedMotionState(savedReducedMotion);
  }, []);
  
  // Effect for DATA loading based on ROLE
  useEffect(() => {
    const loadDataForRole = async () => {
        setIsLoading(true);
        if (role === 'student') {
            if (!studentDashboardData) { // Only fetch if data doesn't exist
                try {
                    const data = await generateStudentDashboardData({
                        studentName: "Alex Jansen",
                        subjects: ["History", "Math", "Science", "Literature", "Art", "Geography", "Dutch"],
                    });
                    setStudentDashboardData(data);
                } catch (error) {
                    console.error("Failed to load student dashboard data:", error);
                }
            }
        } else { // role is 'teacher'
            if (!teacherDashboardData) { // Only fetch if data doesn't exist
                try {
                    const data = await generateTeacherDashboardData({
                        teacherName: 'Mr. Davison',
                        classNames: ['History - Grade 10', 'Modern Art History', 'Geography - Grade 11', 'World History - AP'],
                    });
                    setTeacherDashboardData(data);
                } catch (error) {
                    console.error("Failed to load teacher dashboard data:", error);
                }
            }
        }
        setIsLoading(false);
    };
    
    loadDataForRole();
  }, [role, studentDashboardData, teacherDashboardData]);
  
  // Handlers to update state and localStorage
  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem('studyweb-language', newLanguage);
  };
  
  const setRole = (newRole: UserRole) => {
    if (newRole === role) return;
    setRoleState(newRole);
    localStorage.setItem('studyweb-role', newRole);
  };
  
  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    localStorage.setItem('studyweb-high-contrast', String(enabled));
  };
  
  const setDyslexiaFont = (enabled: boolean) => {
    setDyslexiaFontState(enabled);
    localStorage.setItem('studyweb-dyslexia-font', String(enabled));
  };

  const setReducedMotion = (enabled: boolean) => {
    setReducedMotionState(enabled);
    localStorage.setItem('studyweb-reduced-motion', String(enabled));
  };

  // Effects to apply styles to the document
  useEffect(() => {
    const html = document.documentElement;
    if (highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    const body = document.body;
    if (dyslexiaFont) {
      body.classList.add('font-dyslexia');
    } else {
      body.classList.remove('font-dyslexia');
    }
  }, [dyslexiaFont]);
  
  useEffect(() => {
    const body = document.body;
    if (reducedMotion) {
      body.setAttribute('data-reduced-motion', 'true');
    } else {
      body.removeAttribute('data-reduced-motion');
    }
  }, [reducedMotion]);


  const contextValue = {
    studentDashboardData,
    teacherDashboardData,
    isLoading,
    language,
    setLanguage,
    role,
    setRole,
    highContrast,
    setHighContrast,
    dyslexiaFont,
    setDyslexiaFont,
    reducedMotion,
    setReducedMotion,
    sessionRecap,
    setSessionRecap,
  };


  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};