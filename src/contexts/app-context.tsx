'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { generateDashboardData, GenerateDashboardDataOutput } from '@/ai/flows/generate-dashboard-data';

export type AppContextType = {
  dashboardData: GenerateDashboardDataOutput | null;
  isLoading: boolean;
  language: string;
  setLanguage: (language: string) => void;
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [dashboardData, setDashboardData] = useState<GenerateDashboardDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    // Load saved language from localStorage on initial load
    const savedLanguage = localStorage.getItem('studyweb-language');
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }

    async function loadInitialData() {
      setIsLoading(true);
      try {
        const data = await generateDashboardData({
          studentName: "Alex Jansen",
          subjects: ["History", "Math", "Science", "Literature", "Art", "Geography", "Dutch"],
        });
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);
  
  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem('studyweb-language', newLanguage);
  };


  return (
    <AppContext.Provider value={{ dashboardData, isLoading, language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
};
