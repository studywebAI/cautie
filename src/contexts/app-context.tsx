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

  // ---- Data Fetching ----
  const fetchRemoteData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetch('/api/classes').then(res => res.json()).then(data => setClasses(data || [])),
      fetch('/api/assignments').then(res => res.json()).then(data => setAssignments(data || []))
    ]);
    setIsLoading(false);
  }, []);

  const fetchLocalData = useCallback(() => {
    setIsLoading(true);
    setClasses(getFromLocalStorage('studyweb-classes', []));
    setAssignments(getFromLocalStorage('studyweb-assignments', []));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (session) {
      // **TODO**: Sync local data to remote on login
      fetchRemoteData();
    } else {
      fetchLocalData();
    }
  }, [session, fetchRemoteData, fetchLocalData]);


  // ---- Data Creation ----
  const createClass = async (newClass: { name: string; description: string | null }) => {
    if (session) {
      // Logged in: POST to API
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });
      if (!response.ok) throw new Error('Failed to create class remotely');
      await fetchRemoteData();
    } else {
      // Logged out: Save to localStorage
      const newClassWithId: ClassInfo = {
        ...newClass,
        id: `local-class-${Date.now()}`,
        created_at: new Date().toISOString(),
        owner_id: 'local-user',
      };
      const updatedClasses = [...classes, newClassWithId];
      saveToLocalStorage('studyweb-classes', updatedClasses);
      setClasses(updatedClasses);
    }
  };

  const createAssignment = async (newAssignment: { title: string; due_date: string; class_id: string }) => {
     if (session) {
      // Logged in: POST to API
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment),
      });
      if (!response.ok) throw new Error('Failed to create assignment remotely');
      await fetchRemoteData();
    } else {
      // Logged out: Save to localStorage
       const newAssignmentWithId: ClassAssignment = {
        ...newAssignment,
        id: `local-assignment-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      const updatedAssignments = [...assignments, newAssignmentWithId];
      saveToLocalStorage('studyweb-assignments', updatedAssignments);
      setAssignments(updatedAssignments);
    }
  };
  
  const refetchClasses = async () => {
    if (session) await fetchRemoteData();
    else fetchLocalData();
  }

  const refetchAssignments = async () => {
    if (session) await fetchRemoteData();
    else fetchLocalData();
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
