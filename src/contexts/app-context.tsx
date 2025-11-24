
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { SessionRecapData, Task, Alert, Deadline, Subject, AiSuggestion, QuickAccessItem, ProgressData } from '@/lib/types';
import type { Tables } from '@/lib/supabase/database.types';
import type { Session } from '@supabase/supabase-js';
import { generateDashboardData } from '@/ai/flows/generate-dashboard-data';


export type UserRole = 'student' | 'teacher';
export type ClassInfo = Tables<'classes'>;
export type ClassAssignment = Tables<'assignments'>;
export type Student = {
    id: string;
    name: string;
    avatarUrl?: string;
    overallProgress: number;
};

type StudentDashboardData = {
    tasks: Task[];
    alerts: Alert[];
    deadlines: Deadline[];
    subjects: Subject[];
    aiSuggestions: AiSuggestion[];
    quickAccessItems: QuickAccessItem[];
    progressData: ProgressData[];
}


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
  studentDashboardData: StudentDashboardData | null;
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
        if (item === null) return defaultValue;
        // For non-string types, parse JSON. For strings, just return the item.
        if (typeof defaultValue === 'string') {
            return item as unknown as T;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToLocalStorage = <T,>(key: string, value: T) => {
    if (typeof window === 'undefined') return;
    try {
        const itemToSave = typeof value === 'string' ? value : JSON.stringify(value);
        window.localStorage.setItem(key, itemToSave);
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
  const [studentDashboardData, setStudentDashboardData] = useState<StudentDashboardData | null>(null);

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Track previous session state to detect login
  const [prevSession, setPrevSession] = useState<Session | null>(session);

  const syncLocalDataToSupabase = useCallback(async () => {
    console.log("Starting data sync to Supabase...");
    const localClasses = getFromLocalStorage<ClassInfo[]>('studyweb-local-classes', []);
    const localAssignments = getFromLocalStorage<ClassAssignment[]>('studyweb-local-assignments', []);

    if (localClasses.length === 0 && localAssignments.length === 0) {
      console.log("No local data to sync.");
      return; // Nothing to sync
    }

    try {
      // Sync classes
      const syncedClasses = await Promise.all(localClasses.map(async (cls) => {
        const response = await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cls.name, description: cls.description }),
        });
        if (!response.ok) throw new Error(`Failed to sync class: ${cls.name}`);
        const savedClass = await response.json();
        // Return a map from old local ID to new remote ID
        return { localId: cls.id, remoteId: savedClass.id };
      }));
      console.log("Synced classes:", syncedClasses);

      // Create a mapping from old local class IDs to new Supabase class IDs
      const classIdMap = new Map(syncedClasses.map(c => [c.localId, c.remoteId]));

      // Sync assignments, using the new class IDs
      await Promise.all(localAssignments.map(async (asn) => {
        const remoteClassId = classIdMap.get(asn.class_id);
        if (!remoteClassId) {
          console.warn(`Skipping assignment "${asn.title}" because its class was not synced.`);
          return;
        }
        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              title: asn.title, 
              due_date: asn.due_date,
              class_id: remoteClassId, // Use the new ID
          }),
        });
        if (!response.ok) throw new Error(`Failed to sync assignment: ${asn.title}`);
      }));
      console.log("Synced assignments.");

      // Clear local storage after successful sync
      saveToLocalStorage('studyweb-local-classes', []);
      saveToLocalStorage('studyweb-local-assignments', []);
      console.log("Local storage cleared.");
    } catch (error) {
      console.error("Data synchronization failed:", error);
      // Optionally, notify the user that sync failed
    }
  }, []);
  
  const fetchData = useCallback(async () => {
      setIsLoading(true);
      if (session) {
          // User is logged in
          try {
              const [classesRes, assignmentsRes, dashboardRes] = await Promise.all([
                  fetch('/api/classes'),
                  fetch('/api/assignments'),
                  generateDashboardData({ studentName: session.user.email || 'Student', subjects: ["History", "Math", "Science", "Dutch"] })
              ]);
              if (!classesRes.ok || !assignmentsRes.ok) {
                throw new Error('Failed to fetch data from API');
              }
              const classesData = await classesRes.json();
              const assignmentsData = await assignmentsRes.json();
              setClasses(classesData || []);
              setAssignments(assignmentsData || []);
              setStudentDashboardData(dashboardRes);
          } catch (error) {
              console.error("Failed to fetch Supabase data:", error);
              setClasses([]);
              setAssignments([]);
              setStudentDashboardData(null);
          }
      } else {
          // User is a guest, fetch from localStorage and generate some AI data
           try {
                const [localClasses, localAssignments, dashboardRes] = await Promise.all([
                    Promise.resolve(getFromLocalStorage<ClassInfo[]>('studyweb-local-classes', [])),
                    Promise.resolve(getFromLocalStorage<ClassAssignment[]>('studyweb-local-assignments', [])),
                    generateDashboardData({ studentName: 'Guest', subjects: ["History", "Math", "Science", "Dutch"] })
                ]);
                setClasses(localClasses);
                setAssignments(localAssignments);
                setStudentDashboardData(dashboardRes);
            } catch (error) {
                console.error("Failed to fetch guest data:", error);
                setStudentDashboardData(null);
            }
      }
      setIsLoading(false);
  }, [session]);
  
  useEffect(() => {
    const wasGuest = !prevSession;
    const isLoggedInNow = !!session;

    if (wasGuest && isLoggedInNow) {
      // User has just logged in, start sync
      syncLocalDataToSupabase().then(() => {
        // After sync, fetch the authoritative data from Supabase
        fetchData();
      });
    } else {
      // Regular data fetch on load or session change (e.g., logout)
      fetchData();
    }
    
    // Update previous session state for next render
    setPrevSession(session);
  }, [session, prevSession, fetchData, syncLocalDataToSupabase]);


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
            id: `local-assign-${Date.now()}`,
            created_at: new Date().toISOString(),
            content: null,
            ...newAssignmentData
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
    studentDashboardData,
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
