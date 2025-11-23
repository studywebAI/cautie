
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { SessionRecapData } from '@/lib/types';
import type { Tables } from '@/lib/supabase/database.types';

export type UserRole = 'student' | 'teacher';
export type ClassInfo = Tables<'classes'>;
export type ClassAssignment = Tables<'assignments'>;
export type Student = {
    id: string;
    name: string;
    avatarUrl?: string;
    overallProgress: number;
};


export type AppContextType = {
  isLoading: boolean;
  language: string;
  setLanguage: (language: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  dyslexiaFont: boolean;
  setDyslexiaFont: (enabled: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  sessionRecap: SessionRecapData | null;
  setSessionRecap: (data: SessionRecapData | null) => void;
  classes: ClassInfo[];
  setClasses: React.Dispatch<React.SetStateAction<ClassInfo[]>>;
  assignments: ClassAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<ClassAssignment[]>>;
  students: Student[];
  refetchClasses: () => Promise<void>;
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  const [language, setLanguageState] = useState('en');
  const [role, setRoleState] = useState<UserRole>('student');
  const [highContrast, setHighContrastState] = useState(false);
  const [dyslexiaFont, setDyslexiaFontState] = useState(false);
  const [reducedMotion, setReducedMotionState] = useState(false);

  const [sessionRecap, setSessionRecap] = useState<SessionRecapData | null>(null);

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
        const response = await fetch('/api/classes');
        if (!response.ok) {
            throw new Error('Failed to fetch classes');
        }
        const data = await response.json();
        setClasses(data);
    } catch (error) {
        console.error(error);
        // Optionally set an error state to show in the UI
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'teacher') {
        fetchClasses();
    } else {
        // Handle student data loading if necessary, for now just finish loading
        setIsLoading(false);
    }
  }, [role]);

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

  useEffect(() => {
    const html = document.documentElement;
    if (highContrast) html.classList.add('high-contrast');
    else html.classList.remove('high-contrast');
  }, [highContrast]);

  useEffect(() => {
    const body = document.body;
    if (dyslexiaFont) body.classList.add('font-dyslexia');
    else body.classList.remove('font-dyslexia');
  }, [dyslexiaFont]);
  
  useEffect(() => {
    const body = document.body;
    if (reducedMotion) body.setAttribute('data-reduced-motion', 'true');
    else body.removeAttribute('data-reduced-motion');
  }, [reducedMotion]);


  const contextValue: AppContextType = {
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
    classes,
    setClasses,
    assignments,
    setAssignments,
    students,
    refetchClasses: fetchClasses,
  };


  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
