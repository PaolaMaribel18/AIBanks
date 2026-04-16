import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import es from './locales/es';
import en from './locales/en';

// ─── Registry ───────────────────────────────────────────────────
// To add a new language: 1) create locales/xx.js  2) import it  3) add it here.
const LOCALES = { es, en };
const DEFAULT_LANGUAGE = 'es';
const STORAGE_KEY = 'app_language';

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Resolve a dot-separated key from a nested object.
 *  getNestedValue({ a: { b: 'hi' } }, 'a.b')  →  'hi'
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

/**
 * Replace `{{variable}}` placeholders with values from `params`.
 *  interpolate('Hello, {{name}}!', { name: 'María' })  →  'Hello, María!'
 */
function interpolate(template, params) {
  if (!params || typeof template !== 'string') return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{{${key}}}`
  );
}

// ─── Context ────────────────────────────────────────────────────
const LanguageContext = createContext(null);

// ─── Provider ───────────────────────────────────────────────────
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && LOCALES[stored]) return stored;
    } catch {
      // ignore
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = useCallback((lang) => {
    if (!LOCALES[lang]) return;
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key, params) => {
      const value = getNestedValue(LOCALES[language], key);
      if (value === undefined) {
        // Fallback to default language
        const fallback = getNestedValue(LOCALES[DEFAULT_LANGUAGE], key);
        if (fallback === undefined) {
          // Development hint
          if (import.meta.env.DEV) {
            console.warn(`[i18n] Missing key: "${key}"`);
          }
          return key;
        }
        return interpolate(fallback, params);
      }
      return interpolate(value, params);
    },
    [language]
  );

  // Expose available languages for the selector UI
  const availableLanguages = useMemo(
    () => Object.keys(LOCALES),
    []
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, availableLanguages }),
    [language, setLanguage, t, availableLanguages]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────
export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return ctx;
}
