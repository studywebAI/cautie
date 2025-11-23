import * as en from './dictionaries/en.json';
import * as nl from './dictionaries/nl.json';

const dictionaries = {
  en: () => en,
  nl: () => nl,
};

export type Dictionary = typeof en;
export type Locale = keyof typeof dictionaries;

export const getDictionary = (locale: Locale): Dictionary => {
    const dict = dictionaries[locale] ? dictionaries[locale]() : dictionaries.en();
    // Since we are not doing dynamic imports, we can just cast it.
    // In a real-world app with dynamic imports, you'd have to handle promises.
    return dict as Dictionary;
};
