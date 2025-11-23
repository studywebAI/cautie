'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDictionary } from '@/lib/get-dictionary';
import type { Dictionary } from '@/lib/get-dictionary';
import { AppContext } from './app-context';

type DictionaryContextType = {
  dictionary: Dictionary;
};

const DictionaryContext = createContext<DictionaryContextType | null>(null);

export const DictionaryProvider = ({ children }: { children: React.ReactNode }) => {
  const appContext = useContext(AppContext);
  const lang = appContext?.language || 'en';
  const [dictionary, setDictionary] = useState<Dictionary>(() => getDictionary(lang));

  useEffect(() => {
    const newDict = getDictionary(lang);
    setDictionary(newDict);
  }, [lang]);

  if (!dictionary) {
    return null; // Or a loading state
  }

  return (
    <DictionaryContext.Provider value={{ dictionary }}>
      {children}
    </DictionaryContext.Provider>
  );
};

export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
};
