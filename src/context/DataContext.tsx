'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LabData, PageVisibilityMap, LabSettings } from '@/lib/types';
import { seedData } from '@/lib/seedData';
import { useToast } from './ToastContext';

const STORAGE_KEY = 'edgesys-lab-data-v1';

interface DataContextType {
  data: LabData;
  saveData: (message?: string) => void;
  updateSettings: (settings: Partial<LabSettings>) => void;
  togglePageActive: (pageKey: keyof PageVisibilityMap) => void;
  addItem: <K extends 'research' | 'people' | 'publications' | 'projects' | 'news'>(
    collection: K,
    item: Omit<LabData[K][number], 'id'>
  ) => void;
  updateItem: <K extends 'research' | 'people' | 'publications' | 'projects' | 'news'>(
    collection: K,
    id: string,
    updated: Partial<LabData[K][number]>
  ) => void;
  deleteItem: <K extends 'research' | 'people' | 'publications' | 'projects' | 'news'>(
    collection: K,
    id: string
  ) => void;
  resetDemoData: () => void;
  importJSON: (jsonString: string) => boolean;
  exportJSON: () => void;
}

const DataContext = createContext<DataContextType>({
  data: seedData,
  saveData: () => {},
  updateSettings: () => {},
  togglePageActive: () => {},
  addItem: () => {},
  updateItem: () => {},
  deleteItem: () => {},
  resetDemoData: () => {},
  importJSON: () => false,
  exportJSON: () => {}
});

function cloneSeed(): LabData {
  return JSON.parse(JSON.stringify(seedData));
}

export const DataProvider: React.FC<{ children: React.ReactNode; initialData?: LabData }> = ({
  children,
  initialData
}) => {
  const [data, setData] = useState<LabData>(initialData || seedData);
  const { toast } = useToast();

  // Background fetch to keep client state revalidated
  useEffect(() => {
    fetch('/api/content')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          const content = resData.data;
          if (!content.settings.activePages) {
            content.settings.activePages = { ...seedData.settings.activePages };
          }
          setData(content);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const syncToDatabase = useCallback((nextData: LabData) => {
    fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextData)
    }).catch((err) => {
      console.warn('Background database sync warning:', err);
    });
  }, []);

  const persist = useCallback(
    (nextData: LabData, message = 'Changes saved') => {
      setData(nextData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (err) {
        console.error('Failed to persist to localStorage', err);
      }
      toast(message);
      syncToDatabase(nextData);
    },
    [toast, syncToDatabase]
  );

  const saveData = useCallback(
    (message = 'Changes saved') => {
      persist({ ...data }, message);
    },
    [data, persist]
  );

  const updateSettings = useCallback(
    (newSettings: Partial<LabSettings>) => {
      const updated = {
        ...data,
        settings: {
          ...data.settings,
          ...newSettings,
          activePages: {
            ...data.settings.activePages,
            ...(newSettings.activePages || {})
          }
        }
      };
      persist(updated, 'Site settings updated');
    },
    [data, persist]
  );

  const togglePageActive = useCallback(
    (pageKey: keyof PageVisibilityMap) => {
      const currentActive = data.settings.activePages[pageKey];
      const nextActivePages = {
        ...data.settings.activePages,
        [pageKey]: !currentActive
      };

      const updated = {
        ...data,
        settings: {
          ...data.settings,
          activePages: nextActivePages
        }
      };

      const statusText = !currentActive ? 'activated' : 'deactivated';
      persist(updated, `Page "${pageKey}" ${statusText}`);
    },
    [data, persist]
  );

  const addItem = useCallback(
    <K extends 'research' | 'people' | 'publications' | 'projects' | 'news'>(
      collection: K,
      item: Omit<LabData[K][number], 'id'>
    ) => {
      const id = `id-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const newItem = { ...item, id } as LabData[K][number];
      const updatedList = [...data[collection], newItem];
      const updatedData = { ...data, [collection]: updatedList };
      persist(updatedData, 'Item added successfully');
    },
    [data, persist]
  );

  const updateItem = useCallback(
    <K extends 'research' | 'people' | 'publications' | 'projects' | 'news'>(
      collection: K,
      id: string,
      updatedFields: Partial<LabData[K][number]>
    ) => {
      const updatedList = data[collection].map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      );
      const updatedData = { ...data, [collection]: updatedList };
      persist(updatedData, 'Item updated successfully');
    },
    [data, persist]
  );

  const deleteItem = useCallback(
    <K extends 'research' | 'people' | 'publications' | 'projects' | 'news'>(
      collection: K,
      id: string
    ) => {
      const updatedList = data[collection].filter((item) => item.id !== id);
      const updatedData = { ...data, [collection]: updatedList };
      persist(updatedData, 'Item deleted');
    },
    [data, persist]
  );

  const resetDemoData = useCallback(() => {
    const fresh = cloneSeed();
    persist(fresh, 'Demo content restored');
  }, [persist]);

  const importJSON = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.settings || !parsed.people || !parsed.publications) {
          throw new Error('Invalid JSON structure');
        }
        if (!parsed.settings.activePages) {
          parsed.settings.activePages = { ...seedData.settings.activePages };
        }
        persist(parsed, 'Content imported successfully');
        return true;
      } catch {
        toast('Invalid content file format');
        return false;
      }
    },
    [persist, toast]
  );

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.settings.shortName.toLowerCase().replace(/\s+/g, '-')}-content.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Content exported to JSON');
  }, [data, toast]);

  return (
    <DataContext.Provider
      value={{
        data,
        saveData,
        updateSettings,
        togglePageActive,
        addItem,
        updateItem,
        deleteItem,
        resetDemoData,
        importJSON,
        exportJSON
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
