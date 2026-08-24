import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface SavedContextValue {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
}

const SavedContext = createContext<SavedContextValue | null>(null);
const STORAGE_KEY = "meridian.saved.v1";

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // best-effort persistence only
    }
  }, [savedIds]);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <SavedContext.Provider value={{ savedIds, isSaved: (id) => savedIds.includes(id), toggleSaved }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
