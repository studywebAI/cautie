
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { SessionRecapData, Task, Alert, Deadline, Subject, AiSuggestion, QuickAccessItem, ProgressData } from '@/lib/types';
import type { Tables } from '@/lib/supabase/database.types';
import type { Session } from '@supabase/supabase-js';
import type { Student } from '@/lib/teacher-types';


export type UserRole = 'student' | 'teacher';
export type ClassInfo = Tables<'classes'>;
export type ClassAssignment = Tables<'assignments'>;
export type PersonalTask = Tables<'personal_tasks'>;


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
  classes: ClassInfo[];
  createClass: (newClass: { name: string; description: string | null }) => Promise<void>;
  refetchClasses: () => Promise<void>;
  assignments: ClassAssignment[];
  createAssignment: (newAssignment: Omit<ClassAssignment, 'id' | 'created_at' | 'content'>) => Promise<void>;
  refetchAssignments: () => Promise<void>;
  students: Student[];
  personalTasks: PersonalTask[];
  createPersonalTask: (newTask: Omit<PersonalTask, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
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
        // If parsing fails, it's likely a plain string that shouldn't have been parsed.
        // This is a recovery mechanism from the previous bug.
        const item = window.localStorage.getItem(key);
        if (item) {
          return item as unknown as T;
        }
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

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
  
  // Track previous session state to detect login
  const [prevSession, setPrevSession] = useState<Session | null>(session);

  const syncLocalDataToSupabase = useCallback(async () => {
    console.log("Starting data sync to Supabase...");
    const localClasses = getFromLocalStorage<ClassInfo[]>('studyweb-local-classes', []);
    const localAssignments = getFromLocalStorage<ClassAssignment[]>('studyweb-local-assignments', []);
    const localPersonalTasks = getFromLocalStorage<PersonalTask[]>('studyweb-local-personal-tasks', []);


    if (localClasses.length === 0 && localAssignments.length === 0 && localPersonalTasks.length === 0) {
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

      // Sync personal tasks
      await Promise.all(localPersonalTasks.map(async (task) => {
        const response = await fetch('/api/personal-tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            date: task.date,
            subject: task.subject,
          }),
        });
        if (!response.ok) throw new Error(`Failed to sync personal task: ${task.title}`);
      }));
      console.log("Synced personal tasks.");


      // Clear local storage after successful sync
      saveToLocalStorage('studyweb-local-classes', []);
      saveToLocalStorage('studyweb-local-assignments', []);
      saveToLocalStorage('studyweb-local-personal-tasks', []);
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
              const [classesRes, assignmentsRes, personalTasksRes] = await Promise.all([
                  fetch('/api/classes'),
                  fetch('/api/assignments'),
                  fetch('/api/personal-tasks'),
              ]);
              if (!classesRes.ok || !assignmentsRes.ok || !personalTasksRes.ok) {
                throw new Error('Failed to fetch data from API');
              }
              const classesData = await classesRes.json();
              const assignmentsData = await assignmentsRes.json();
              const personalTasksData = await personalTasksRes.json();
              setClasses(classesData || []);
              setAssignments(assignmentsData || []);
              setPersonalTasks(personalTasksData || []);
              
              // Fetch all students for all classes owned by the teacher
              const ownedClassIds = (classesData || []).filter((c: ClassInfo) => c.owner_id === session.user.id).map((c: ClassInfo) => c.id);
              if (ownedClassIds.length > 0) {
                 const studentPromises = ownedClassIds.map((id: string) => fetch(`/api/classes/${id}/members`).then(res => res.json()));
                 const studentsPerClass = await Promise.all(studentPromises);
                 const allStudents = studentsPerClass.flat();
                 // Remove duplicates
                 const uniqueStudents = Array.from(new Set(allStudents.map(s => s.id))).map(id => allStudents.find(s => s.id === id));
                 setStudents(uniqueStudents || []);
              }

          } catch (error) {
              console.error("Failed to fetch Supabase data:", error);
              setClasses([]);
              setAssignments([]);
              setPersonalTasks([]);
              setStudents([]);
          }
      } else {
          // User is a guest, fetch from localStorage
           try {
                const [localClasses, localAssignments, localPersonalTasks] = await Promise.all([
                    Promise.resolve(getFromLocalStorage<ClassInfo[]>('studyweb-local-classes', [])),
                    Promise.resolve(getFromLocalStorage<ClassAssignment[]>('studyweb-local-assignments', [])),
                    Promise.resolve(getFromLocalStorage<PersonalTask[]>('studyweb-local-personal-tasks', [])),
                ]);
                setClasses(localClasses);
                setAssignments(localAssignments);
                setPersonalTasks(localPersonalTasks);
            } catch (error) {
                console.error("Failed to fetch guest data:", error);
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
      await refetchClasses();
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

  const createAssignment = async (newAssignmentData: Omit<ClassAssignment, 'id' | 'created_at' | 'content'>) => {
     if (session) {
        // Logged-in user: save to Supabase
        const response = await fetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAssignmentData),
        });
        if (!response.ok) throw new Error('Failed to create assignment in Supabase');
        await refetchAssignments();
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

   const createPersonalTask = async (newTaskData: Omit<PersonalTask, 'id' | 'created_at' | 'user_id'>) => {
     if (session) {
        const response = await fetch('/api/personal-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTaskData),
        });
        if (!response.ok) throw new Error('Failed to create personal task in Supabase');
        const newTask = await response.json();
        setPersonalTasks(prev => [...prev, newTask]);
     } else {
        const newTask: PersonalTask = {
            id: `local-task-${Date.now()}`,
            created_at: new Date().toISOString(),
            user_id: 'local-user',
            ...newTaskData
        };
        const updatedTasks = [...personalTasks, newTask];
        setPersonalTasks(updatedTasks);
        saveToLocalStorage('studyweb-local-personal-tasks', updatedTasks);
     }
  };
  
  const refetchClasses = useCallback(async () => {
    if (session) {
        const res = await fetch('/api/classes');
        if (res.ok) {
            const data = await res.json();
            setClasses(data || []);
        }
    }
  }, [session]);

  const refetchAssignments = useCallback(async () => {
     if (session) {
        const res = await fetch('/api/assignments');
        if (res.ok) {
            const data = await res.json();
            setAssignments(data || []);
        }
    }
  }, [session]);

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
    personalTasks,
    createPersonalTask,
  };


  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
