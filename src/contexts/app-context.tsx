'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { generateDashboardData, GenerateDashboardDataOutput } from '@/ai/flows/generate-dashboard-data';

export type AppContextType = {
  dashboardData: GenerateDashboardDataOutput | null;
  isLoading: boolean;
  language: string;
  setLanguage: (language: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [dashboardData, setDashboardData] = useState<GenerateDashboardDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const data = await generateDashboardData({
          studentName: "Alex Jansen",
          subjects: ["History", "Mathematics", "Chemistry", "English Literature", "Dutch"],
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

  return (
    <AppContext.Provider value={{ dashboardData, isLoading, language, setLanguage, soundEnabled, setSoundEnabled }}>
      {children}
    </AppContext.Provider>
  );
};
