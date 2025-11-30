
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react';
import type { SessionRecapData } from '@/lib/types';
import type { Tables } from '@/lib/supabase/database.types';
import type { Session } from '@supabase/supabase-js';
import type { Student, MaterialReference } from '@/lib/teacher-types';
import { getDictionary } from '@/lib/get-dictionary';
import type { Dictionary } from '@/lib/get-dictionary';


export type UserRole = 'student' | 'teacher';
export type ClassInfo = Tables<'classes'>;
export type ClassAssignment = Tables<'assignments'>;
export type PersonalTask = Tables<'personal_tasks'>;

export type AppContextType = {
  session: Session | null;
  isLoading: boolean;
  language: 'en' | 'nl';
  setLanguage: (language: 'en' | 'nl') => void;
  dictionary: Dictionary;
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void; // New function
  teacherView: boolean;
  setTeacherView: (enabled: boolean) => void;
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
  createStudyPlanTasks: (newTasks: Omit<PersonalTask, 'id' | 'created_at' | 'user_id'>[]) => Promise<void>;
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
        // For non-string types, parse JSON. For strings, just return the item.
        if (typeof defaultValue === 'string') {
            // Validate language specifically
            if (key === 'studyweb-language' && item !== 'en' && item !== 'nl') {
                return defaultValue; // Fallback to default if invalid language
            }
            return item as unknown as T;
        }
        return JSON.parse(item);
    } catch (error) {
        const item = window.localStorage.getItem(key);
        if (item) {
          // Validate language specifically
          if (key === 'studyweb-language' && item !== 'en' && item !== 'nl') {
              return defaultValue; // Fallback to default if invalid language
          }
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
  const [teacherView, setTeacherViewState] = useState(false);
  const [highContrast, setHighContrastState] = useState(false);
  const [dyslexiaFont, setDyslexiaFontState] = useState(false);
  const [reducedMotion, setReducedMotionState] = useState(false);

  const [sessionRecap, setSessionRecap] = useState<SessionRecapData | null>(null);

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
  const [materials, setMaterials] = useState<MaterialReference[]>([]);
  
  const [prevSession, setPrevSession] = useState<Session | null>(session);

  const createStudyPlanTasks = async (newTasks: Omit<PersonalTask, 'id' | 'created_at' | 'user_id'>[]) => {
    const response = await fetch('/api/personal-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: newTasks }), // Send as an array
    });
    if (response.ok) {
        const createdTasks = await response.json();
        setPersonalTasks(prev => [...prev, ...createdTasks]);
    }
    // Handle error case appropriately
  };

  // ... (sync and fetch data logic remains the same)

  const createClass = useCallback(async (newClass: { name: string; description: string | null }) => {
    // Placeholder for class creation logic
    console.log('createClass called with:', newClass);
    return null;
  }, []);

  const refetchClasses = useCallback(async () => {
    // Placeholder for refetching classes logic
    console.log('refetchClasses called');
  }, []);

  const createAssignment = useCallback(async (newAssignment: Omit<ClassAssignment, 'id' | 'created_at'>) => {
    // Placeholder for assignment creation logic
    console.log('createAssignment called with:', newAssignment);
  }, []);

  const refetchAssignments = useCallback(async () => {
    // Placeholder for refetching assignments logic
    console.log('refetchAssignments called');
  }, []);

  const createPersonalTask = useCallback(async (newTask: Omit<PersonalTask, 'id' | 'created_at' | 'user_id'>) => {
    // Placeholder for personal task creation logic
    console.log('createPersonalTask called with:', newTask);
  }, []);

  const refetchMaterials = useCallback(async (classId: string) => {
    // Placeholder for refetching materials logic
    console.log('refetchMaterials called for classId:', classId);
  }, []);

  useEffect(() => {
    // ... (existing useEffect logic)
  }, [session, prevSession]);

  // ... (data creation functions remain the same)

  // ---- Settings and Preferences ----
  useEffect(() => {
    setLanguageState(getFromLocalStorage<'en' | 'nl'>('studyweb-language', 'en'));
    setRoleState(getFromLocalStorage('studyweb-role', 'student'));
    setTeacherViewState(getFromLocalStorage('studyweb-teacher-view', false));
    
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
  
  const setLanguage = (newLanguage: 'en' | 'nl') => {
    setLanguageState(newLanguage);
    saveToLocalStorage('studyweb-language', newLanguage);
    const newDict = getDictionary(newLanguage);
    setDictionary(newDict);
  };
  
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    saveToLocalStorage('studyweb-role', newRole);
  };

  const toggleRole = () => {
    const newRole = role === 'student' ? 'teacher' : 'student';
    setRole(newRole);
    // Force a reload to apply the new role everywhere
    window.location.reload();
  };
  
  const setTeacherView = (enabled: boolean) => {
    setTeacherViewState(enabled);
    saveToLocalStorage('studyweb-teacher-view', enabled);
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
    toggleRole, // Added function
    teacherView,
    setTeacherView,
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
    createStudyPlanTasks,
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
    throw new Error('useDictionary must be used within an AppContextProvider');
  }
  return { dictionary: context.dictionary };
};
