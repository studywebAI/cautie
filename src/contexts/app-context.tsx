'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { SessionRecapData } from '@/lib/types';
import type { Tables } from '@/lib/supabase/database.types';
import type { Session } from '@supabase/supabase-js';

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
  session: Session | null;
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
  refetchClasses: () => Promise<void>;
  assignments: ClassAssignment[];
  refetchAssignments: () => Promise<void>;
  students: Student[];
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children, session }: { children: ReactNode, session: Session | null }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  
  const [language, setLanguageState] = useState('en');
  const [role, setRoleState] = useState<UserRole>('student');
  const [highContrast, setHighContrastState] = useState(false);
  const [dyslexiaFont, setDyslexiaFontState] = useState(false);
  const [reducedMotion, setReducedMotionState] = useState(false);

  const [sessionRecap, setSessionRecap] = useState<SessionRecapData | null>(null);

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherDataLoaded, setTeacherDataLoaded] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Failed to fetch classes');
        const data = await response.json();
        setClasses(data);
    } catch (error) {
        console.error(error);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
        const response = await fetch('/api/assignments');
        if (!response.ok) throw new Error('Failed to fetch assignments');
        const data = await response.json();
        setAssignments(data);
    } catch (error) {
        console.error(error);
    }
  }, []);


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
    setIsInitialLoadComplete(true);
  }, []);
  
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

  useEffect(() => {
    if (!isInitialLoadComplete || !session) return;
    
    async function loadDataForRole() {
      setIsLoading(true);
      if (role === 'teacher' && !teacherDataLoaded) {
        await Promise.all([fetchClasses(), fetchAssignments()]);
        setTeacherDataLoaded(true);
      }
      // Student data would be fetched here
      setIsLoading(false);
    }
    loadDataForRole();
  }, [role, isInitialLoadComplete, session, fetchClasses, fetchAssignments, teacherDataLoaded]);
  
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
     const html = document.documentElement;
    if (enabled) html.classList.add('high-contrast');
    else html.classList.remove('high-contrast');
  };
  
  const setDyslexiaFont = (enabled: boolean) => {
    setDyslexiaFontState(enabled);
    localStorage.setItem('studyweb-dyslexia-font', String(enabled));
  };

  const setReducedMotion = (enabled: boolean) => {
    setReducedMotionState(enabled);
    localStorage.setItem('studyweb-reduced-motion', String(enabled));
  };


  const contextValue: AppContextType = {
    session,
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
    refetchClasses: fetchClasses,
    assignments,
    refetchAssignments: fetchAssignments,
    students,
  };


  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
