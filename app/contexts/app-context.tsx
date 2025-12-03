
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react';
import type { SessionRecapData } from '@/lib/types';
import type { Tables } from '@/lib/supabase/database.types';
import type { Session } from '@supabase/supabase-js';
import type { Student, MaterialReference } from '@/lib/teacher-types';
import { getDictionary } from '@/lib/get-dictionary';
import type { Dictionary } from '@/lib/get-dictionary';
import { createBrowserClient } from '@supabase/ssr'


export type UserRole = 'student' | 'teacher';
export type ClassInfo = Tables<'classes'>;
export type ClassAssignment = Tables<'assignments'>;
export type PersonalTask = Tables<'personal_tasks'>;

export type AppContextType = {
  session: Session | null;
  isLoading: boolean;
  language: string;
  setLanguage: (language: string) => void;
  dictionary: Dictionary;
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
  createClass: (newClass: { name: string; description: string | null }) => Promise<ClassInfo | null>;
  refetchClasses: () => Promise<void>;
  assignments: ClassAssignment[];
  createAssignment: (newAssignment: Omit<ClassAssignment, 'id' | 'created_at'>) => Promise<void>;
  refetchAssignments: () => Promise<void>;
  students: Student[];
  personalTasks: PersonalTask[];
  createPersonalTask: (newTask: Omit<PersonalTask, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  materials: MaterialReference[];
  refetchMaterials: (classId: string) => Promise<void>;
};

export const AppContext = createContext<AppContextType | null>(null);

// Helper functions for local storage
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const item = window.localStorage.getItem(key);
        if (item === null) return defaultValue;
        if (typeof defaultValue === 'string') {
            return item as unknown as T;
        }
        return JSON.parse(item);
    } catch (error) {
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


export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [language, setLanguageState] = useState<'en' | 'nl'>('en');
  const [dictionary, setDictionary] = useState<Dictionary>(() => getDictionary(language));
  const [role, setRoleState] = useState<UserRole>('student');
  const [highContrast, setHighContrastState] = useState(false);
  const [dyslexiaFont, setDyslexiaFontState] = useState(false);
  const [reducedMotion, setReducedMotionState] = useState(false);

  const [sessionRecap, setSessionRecap] = useState<SessionRecapData | null>(null);

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
  const [materials, setMaterials] = useState<MaterialReference[]>([]);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [guestId, setGuestId] = useState<string | null>(null);

  const syncLocalDataToSupabase = useCallback(async (currentGuestId: string) => {
    console.log("Starting data sync to Supabase...");
    const localClasses = getFromLocalStorage<ClassInfo[]>('studyweb-local-classes', []);
    const localAssignments = getFromLocalStorage<ClassAssignment[]>('studyweb-local-assignments', []);
    const localPersonalTasks = getFromLocalStorage<PersonalTask[]>('studyweb-local-personal-tasks', []);

    if (localClasses.length === 0 && localAssignments.length === 0 && localPersonalTasks.length === 0) {
      console.log("No local data to sync.");
      return; 
    }

    try {
      const syncedClasses = await Promise.all(localClasses.map(async (cls: ClassInfo) => {
        const response = await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cls.name, description: cls.description, guestId: currentGuestId }),
        });
        if (!response.ok) throw new Error(`Failed to sync class: ${cls.name}`);
        const savedClass = await response.json();
        return { localId: cls.id, remoteId: savedClass.id };
      }));
      console.log("Synced classes:", syncedClasses);

      const classIdMap = new Map(syncedClasses.map(c => [c.localId, c.remoteId]));

      await Promise.all(localAssignments.map(async (asn: ClassAssignment) => {
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
              class_id: remoteClassId, 
              guestId: currentGuestId,
          }),
        });
        if (!response.ok) throw new Error(`Failed to sync assignment: ${asn.title}`);
      }));
      console.log("Synced assignments.");

      await Promise.all(localPersonalTasks.map(async (task: PersonalTask) => {
        const response = await fetch("/api/personal-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            date: task.date,
            subject: task.subject,
            guestId: currentGuestId,
          }),
        });
        if (!response.ok) throw new Error(`Failed to sync personal task: ${task.title}`);
      }));
      console.log("Synced personal tasks.");

      saveToLocalStorage('studyweb-local-classes', []);
      saveToLocalStorage('studyweb-local-assignments', []);
      saveToLocalStorage('studyweb-local-personal-tasks', []);
      console.log("Local storage cleared.");
    } catch (error) {
      console.error("Data synchronization failed:", error);
    }
  }, []);
  
  const fetchData = useCallback(async () => {
      setIsLoading(true);
      const currentGuestId = getFromLocalStorage<string | null>('studyweb-guest-id', null);

      if (session) {
          try {
              const [classesRes, assignmentsRes, personalTasksRes] = await Promise.all([
                  fetch('/api/classes'),
                  fetch('/api/assignments'),
                  fetch('/api/personal-tasks'),
              ]);
              if (!classesRes.ok || !assignmentsRes.ok || !personalTasksRes.ok) {
                throw new Error('Failed to fetch data from API');
              }
              const classesData = await classesRes.json() as ClassInfo[];
              const assignmentsData = await assignmentsRes.json() as ClassAssignment[];
              const personalTasksData = await personalTasksRes.json() as PersonalTask[];
              setClasses(classesData || []);
              setAssignments(assignmentsData || []);
              setPersonalTasks(personalTasksData || []);
              
              const ownedClassIds = (classesData || []).filter((c: ClassInfo) => c.owner_id === session?.user.id).map((c: ClassInfo) => c.id);
              if (ownedClassIds.length > 0) {
                 const studentPromises = ownedClassIds.map((id: string) => fetch(`/api/classes/${id}/members`).then(res => res.json()));
                 const studentsPerClass = await Promise.all(studentPromises);
                 const allStudents = studentsPerClass.flat();
                 const uniqueStudents = Array.from(new Set(allStudents.map((s: Student) => s.id))).map(id => allStudents.find((s: Student) => s.id === id));
                 setStudents(uniqueStudents || []);
              }

          } catch (error) {
              console.error("Failed to fetch Supabase data:", error);
              setClasses([]);
              setAssignments([]);
              setPersonalTasks([]);
              setStudents([]);
          }
      } else if (currentGuestId) {
          try {
              const [classesRes, assignmentsRes, personalTasksRes] = await Promise.all([
                  fetch(`/api/classes?guestId=${currentGuestId}`),
                  fetch(`/api/assignments?guestId=${currentGuestId}`),
                  fetch(`/api/personal-tasks?guestId=${currentGuestId}`),
              ]);
              if (!classesRes.ok || !assignmentsRes.ok || !personalTasksRes.ok) {
                throw new Error('Failed to fetch guest data from API');
              }
              const classesData = await classesRes.json() as ClassInfo[];
              const assignmentsData = await assignmentsRes.json() as ClassAssignment[];
              const personalTasksData = await personalTasksRes.json() as PersonalTask[];
              setClasses(classesData || []);
              setAssignments(assignmentsData || []);
              setPersonalTasks(personalTasksData || []);
          } catch (error) {
              console.error("Failed to fetch guest data from API:", error);
              setClasses([]);
              setAssignments([]);
              setPersonalTasks([]);
          }
      } else {
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
                console.error("Failed to fetch guest data from localStorage:", error);
            }
      }
      setIsLoading(false);
  }, [session]);


  const refetchClasses = useCallback(async () => {
    const currentGuestId = getFromLocalStorage<string | null>('studyweb-guest-id', null);
    if (session) {
        const res = await fetch('/api/classes');
        if (res.ok) {
            const data = await res.json() as ClassInfo[];
            setClasses(data || []);
        }
    } else if (currentGuestId) {
        const res = await fetch(`/api/classes?guestId=${currentGuestId}`);
        if (res.ok) {
            const data = await res.json() as ClassInfo[];
            setClasses(data || []);
        }
    }
  }, [session, guestId]);

  const refetchAssignments = useCallback(async () => {
    const currentGuestId = getFromLocalStorage<string | null>('studyweb-guest-id', null);
     if (session) {
        const res = await fetch('/api/assignments');
        if (res.ok) {
            const data = await res.json() as ClassAssignment[];
            setAssignments(data || []);
        }
    } else if (currentGuestId) {
        const res = await fetch(`/api/assignments?guestId=${currentGuestId}`);
        if (res.ok) {
            const data = await res.json() as ClassAssignment[];
            setAssignments(data || []);
        }
        
    }
  }, [session, guestId]);
  
  const refetchMaterials = useCallback(async (classId: string) => {
    const currentGuestId = getFromLocalStorage<string | null>('studyweb-guest-id', null);

    if (session) {
        const res = await fetch(`/api/materials?classId=${classId}`);
        if (res.ok) {
            const data = await res.json() as MaterialReference[];
            setMaterials(data || []);
        }
    } else if (currentGuestId) {
        const res = await fetch(`/api/materials?classId=${classId}&guestId=${currentGuestId}`);
        if (res.ok) {
            const data = await res.json() as MaterialReference[];
            setMaterials(data || []);
        }
    }
  }, [session, guestId]);


  // ---- Data Creation ----
  const createClass = useCallback(async (newClassData: { name: string; description: string | null }): Promise<ClassInfo | null> => {
    if (session) {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClassData),
      });
      if (!response.ok) {
        throw new Error('Failed to create class in Supabase');
      }
      const savedClass = await response.json();
      return savedClass;
    } else if (guestId) {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClassData, guestId: guestId }),
      });
      if (!response.ok) {
        throw new Error('Failed to create class for guest in Supabase');
      }
      const savedClass = await response.json();
      return savedClass;
    } else {
      console.error('Attempted to create class for guest without guestId.');
      return null;
    }
  }, [session, guestId]);

  const createAssignment = useCallback(async (newAssignmentData: Omit<ClassAssignment, 'id' | 'created_at'>) => {
     if (session) {
        const response = await fetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAssignmentData),
        });
        if (!response.ok) throw new Error('Failed to create assignment in Supabase');
        await refetchAssignments();
    } else if (guestId) {
        const response = await fetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newAssignmentData, guestId: guestId }),
        });
        if (!response.ok) throw new Error('Failed to create assignment for guest in Supabase');
        await refetchAssignments();
    } else {
        console.error('Attempted to create assignment for guest without guestId.');
    }
  }, [session, guestId, refetchAssignments]);

   const createPersonalTask = useCallback(async (newTaskData: Omit<PersonalTask, 'id' | 'created_at' | 'user_id'>) => {
     if (session) {
        const response = await fetch('/api/personal-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTaskData),
        });
        if (!response.ok) throw new Error('Failed to create personal task in Supabase');
        const newTask = await response.json();
        setPersonalTasks(prev => [...prev, newTask]);
     } else if (guestId) {
        const response = await fetch('/api/personal-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newTaskData, guestId: guestId }),
        });
        if (!response.ok) throw new Error('Failed to create personal task for guest in Supabase');
        const newTask = await response.json();
        setPersonalTasks(prev => [...prev, newTask]);
     } else {
        console.error('Attempted to create personal task for guest without guestId.');
     }
  }, [session, guestId]);
  
  useEffect(() => {
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (_event === 'SIGNED_IN' && guestId) {
        syncLocalDataToSupabase(guestId);
      }
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (!initialSession) {
        let currentGuestId = getFromLocalStorage<string | null>('studyweb-guest-id', null);
        if (!currentGuestId) {
          currentGuestId = `guest-${Date.now()}`;
          saveToLocalStorage('studyweb-guest-id', currentGuestId);
        }
        setGuestId(currentGuestId);
      }
      setIsLoading(false);
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [supabase, syncLocalDataToSupabase, guestId]);

  useEffect(() => {
    if (!isLoading) {
      fetchData();
    }
  }, [session, guestId, isLoading, fetchData]);

  // ---- Settings and Preferences ----
  useEffect(() => {
    setLanguageState(getFromLocalStorage<'en' | 'nl'>('studyweb-language', 'en'));
    setRoleState(getFromLocalStorage<UserRole>('studyweb-role', 'student'));
    
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
    setLanguageState(newLanguage as 'en' | 'nl');
    saveToLocalStorage('studyweb-language', newLanguage);
    const newDict = getDictionary(newLanguage as 'en' | 'nl');
    setDictionary(newDict);
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
    dictionary,
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
    materials,
    refetchMaterials,
  };


  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useDictionary = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useDictionary must be used within an AppContextProvider");
  }
  return { dictionary: context.dictionary };
};
