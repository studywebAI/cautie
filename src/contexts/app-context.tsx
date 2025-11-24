
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
  createClass: (newClass: { name: string; description: string | null }) => Promise<void>;
  refetchClasses: () => Promise<void>;
  assignments: ClassAssignment[];
  createAssignment: (newAssignment: { title: string; due_date: string; class_id: string }) => Promise<void>;
  refetchAssignments: () => Promise<void>;
  students: Student[];
};

export const AppContext = createContext<AppContextType | null>(null);

// Helper functions for local storage
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToLocalStorage = <T,>(key: string, value: T) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving to localStorage key “${key}”:`, error);
    }
};


export const AppProvider = ({ children, session }: { children: ReactNode, session: Session | null }) => {
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

  // ---- Data Fetching & Management ----
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    if (session) {
      // User is logged in, fetch from Supabase
      try {
        const [classesRes, assignmentsRes] = await Promise.all([
          fetch('/api/classes'),
          fetch('/api/assignments')
        ]);
        const classesData = await classesRes.json();
        const assignmentsData = await assignmentsRes.json();
        setClasses(classesData || []);
        setAssignments(assignmentsData || []);
        // Once synced, we can clear local data to prevent duplicates on next login
        saveToLocalStorage('studyweb-local-classes', []);
        saveToLocalStorage('studyweb-local-assignments', []);
      } catch (error) {
        console.error("Failed to fetch Supabase data:", error);
        setClasses([]);
        setAssignments([]);
      }
    } else {
      // User is a guest, fetch from localStorage
      setClasses(getFromLocalStorage('studyweb-local-classes', []));
      setAssignments(getFromLocalStorage('studyweb-local-assignments', []));
    }
    setIsLoading(false);
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // ---- Data Creation ----
  const createClass = async (newClassData: { name: string; description: string | null }) => {
    if (session) {
      // Logged-in user: save to Supabase
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClassData),
      });
      if (!response.ok) throw new Error('Failed to create class in Supabase');
      const savedClass = await response.json();
      setClasses(prev => [...prev, savedClass]);
    } else {
      // Guest user: save to localStorage
      const newClass: ClassInfo = {
        id: `local-${Date.now()}`,
        name: newClassData.name,
        description: newClassData.description,
        created_at: new Date().toISOString(),
        owner_id: 'local-user',
      };
      const updatedClasses = [...classes, newClass];
      setClasses(updatedClasses);
      saveToLocalStorage('studyweb-local-classes', updatedClasses);
    }
  };

  const createAssignment = async (newAssignmentData: { title: string; due_date: string; class_id: string }) => {
     if (session) {
        // Logged-in user: save to Supabase
        const response = await fetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAssignmentData),
        });
        if (!response.ok) throw new Error('Failed to create assignment in Supabase');
        const savedAssignment = await response.json();
        setAssignments(prev => [...prev, savedAssignment]);
    } else {
        // Guest user: save to localStorage
        const newAssignment: ClassAssignment = {
            id: `local-${Date.now()}`,
            title: newAssignmentData.title,
            due_date: newAssignmentData.due_date,
            class_id: newAssignmentData.class_id,
            created_at: new Date().toISOString(),
        };
        const updatedAssignments = [...assignments, newAssignment];
        setAssignments(updatedAssignments);
        saveToLocalStorage('studyweb-local-assignments', updatedAssignments);
    }
  };
  
  const refetchClasses = async () => {
    await fetchData();
  }

  const refetchAssignments = async () => {
     await fetchData();
  }

  // ---- Settings and Preferences ----
  useEffect(() => {
    setLanguageState(getFromLocalStorage('studyweb-language', 'en'));
    setRoleState(getFromLocalStorage('studyweb-role', 'student'));
    
    const hc = getFromLocalStorage('studyweb-high-contrast', false);
    setHighContrastState(hc);
    if(hc) document.documentElement.classList.add('high-contrast');

    const df = getFromLocalStorage('studyweb-dyslexia-font', false);
    setDyslexiaFontState(df);
     if(df) document.body.classList.add('font-dyslexia');

    const rm = getFromLocalStorage('studyweb-reduced-motion', false);
    setReducedMotionState(rm);
    if(rm) document.body.setAttribute('data-reduced-motion', 'true');
  }, []);
  
  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    saveToLocalStorage('studyweb-language', newLanguage);
  };
  
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    saveToLocalStorage('studyweb-role', newRole);
  };
  
  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    saveToLocalStorage('studyweb-high-contrast', enabled);
     const html = document.documentElement;
    if (enabled) html.classList.add('high-contrast');
    else html.classList.remove('high-contrast');
  };
  
  const setDyslexiaFont = (enabled: boolean) => {
    setDyslexiaFontState(enabled);
    saveToLocalStorage('studyweb-dyslexia-font', enabled);
    const body = document.body;
    if (enabled) body.classList.add('font-dyslexia');
    else body.classList.remove('font-dyslexia');
  };

  const setReducedMotion = (enabled: boolean) => {
    setReducedMotionState(enabled);
    saveToLocalStorage('studyweb-reduced-motion', enabled);
     const body = document.body;
    if (enabled) body.setAttribute('data-reduced-motion', 'true');
    else body.removeAttribute('data-reduced-motion');
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
    createClass,
    refetchClasses,
    assignments,
    createAssignment,
    refetchAssignments,
    students,
  };


  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
