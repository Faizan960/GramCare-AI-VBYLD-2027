import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { TRANSLATIONS } from './translations';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', dir: 'ltr' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', dir: 'ltr' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', dir: 'rtl' },
];

const STORAGE_KEY = 'gramcare_lang';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // Storage unavailable fallback
    }
    return 'en';
  });

  const isRtl = lang === 'ur';

  // Apply direction and language attributes directly to documentElement
  useEffect(() => {
    try {
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      if (isRtl) {
        document.documentElement.classList.add('rtl-mode');
      } else {
        document.documentElement.classList.remove('rtl-mode');
      }
    } catch {
      // In SSR or testing environments
    }
  }, [lang, isRtl]);

  const setLang = useCallback((newLang) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) return;
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Storage unavailable
    }
  }, []);

  // Translation lookup with variable interpolation and fallback
  const t = useCallback(
    (keyPath, params = {}) => {
      const keys = keyPath.split('.');
      let current = TRANSLATIONS[lang];

      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          current = undefined;
          break;
        }
      }

      // Fallback to English if translation is missing
      if (typeof current !== 'string' && lang !== 'en') {
        let fallback = TRANSLATIONS.en;
        for (const k of keys) {
          if (fallback && typeof fallback === 'object' && k in fallback) {
            fallback = fallback[k];
          } else {
            fallback = undefined;
            break;
          }
        }
        current = fallback;
      }

      if (typeof current !== 'string') {
        return keyPath;
      }

      // Interpolate parameters {key}
      let result = current;
      for (const [pKey, pVal] of Object.entries(params)) {
        result = result.replaceAll(`{${pKey}}`, String(pVal));
      }

      return result;
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      isRtl,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [lang, setLang, t, isRtl]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
