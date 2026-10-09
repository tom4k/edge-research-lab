'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LabData, PageVisibilityMap, LabSettings, Publication } from '@/lib/types';
import { seedData } from '@/lib/seedData';
import { useToast } from './ToastContext';

const STORAGE_KEY = 'edgesys-lab-data-v1';

export type CollectionKey = 'research' | 'people' | 'publications' | 'patents' | 'gallery' | 'projects' | 'news';

interface DataContextType {
  data: LabData;
  saveData: (message?: string) => void;
  updateSettings: (settings: Partial<LabSettings>) => void;
  togglePageActive: (pageKey: keyof PageVisibilityMap) => void;
  addItem: <K extends CollectionKey>(
    collection: K,
    item: Omit<NonNullable<LabData[K]>[number], 'id'>
  ) => void;
  updateItem: <K extends CollectionKey>(
    collection: K,
    id: string,
    updated: Partial<NonNullable<LabData[K]>[number]>
  ) => void;
  deleteItem: <K extends CollectionKey>(
    collection: K,
    id: string
  ) => void;
  reorderItems: <K extends CollectionKey>(
    collection: K,
    newItems: NonNullable<LabData[K]>
  ) => void;
  moveItem: <K extends CollectionKey>(
    collection: K,
    id: string,
    direction: 'up' | 'down'
  ) => void;
  setPersonPublications: (personId: string, personName: string, publications: Publication[]) => void;
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
  reorderItems: () => {},
  moveItem: () => {},
  setPersonPublications: () => {},
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
          if (!content.patents) {
            content.patents = [...seedData.patents];
          }
          if (!content.gallery) {
            content.gallery = [...(seedData.gallery || [])];
          }
          setData(content);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Synchronize document theme attributes with settings (dark by default)
  useEffect(() => {
    if (typeof document !== 'undefined' && data?.settings) {
      const mode = data.settings.themeMode || 'dark';
      const preset = data.settings.themePreset || 'cyber-blue';
      document.documentElement.dataset.theme = mode;
      document.documentElement.dataset.themePreset = preset;
    }
  }, [data?.settings?.themeMode, data?.settings?.themePreset]);

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
    <K extends CollectionKey>(
      collection: K,
      item: Omit<NonNullable<LabData[K]>[number], 'id'>
    ) => {
      const id = `id-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const newItem = { ...item, id } as NonNullable<LabData[K]>[number];
      const updatedList = [...((data[collection] as any[]) || []), newItem];
      const updatedData = { ...data, [collection]: updatedList };
      persist(updatedData, 'Item added successfully');
    },
    [data, persist]
  );

  const updateItem = useCallback(
    <K extends CollectionKey>(
      collection: K,
      id: string,
      updatedFields: Partial<NonNullable<LabData[K]>[number]>
    ) => {
      const updatedList = ((data[collection] as any[]) || []).map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      );
      const updatedData = { ...data, [collection]: updatedList };
      persist(updatedData, 'Item updated successfully');
    },
    [data, persist]
  );

  const deleteItem = useCallback(
    <K extends CollectionKey>(
      collection: K,
      id: string
    ) => {
      if (collection === 'people') {
        const personToDelete = (data.people || []).find((p) => p.id === id);
        const nameParts = (personToDelete?.name || '').trim().split(/\s+/).filter(Boolean);
        const lastName = nameParts.length > 0 ? nameParts[nameParts.length - 1].toLowerCase() : null;

        const updatedPeople = (data.people || []).filter((p) => p.id !== id);

        // Delete all corresponding publications linked to this person
        const updatedPublications = (data.publications || []).filter((pub) => {
          if (pub.personId === id) return false;
          if (!pub.personId && lastName && lastName.length >= 2 && pub.authors) {
            const authorsLower = pub.authors.toLowerCase();
            if (authorsLower.includes(lastName)) {
              return false;
            }
          }
          return true;
        });

        const deletedPubsCount = (data.publications || []).length - updatedPublications.length;
        const updatedData = {
          ...data,
          people: updatedPeople,
          publications: updatedPublications
        };

        const msg = deletedPubsCount > 0
          ? `Deleted researcher and ${deletedPubsCount} corresponding publication(s)`
          : 'Researcher deleted';

        persist(updatedData, msg);
        return;
      }

      const updatedList = (data[collection] || []).filter((item) => item.id !== id);
      const updatedData = { ...data, [collection]: updatedList };
      persist(updatedData, 'Item deleted');
    },
    [data, persist]
  );

  const setPersonPublications = useCallback(
    (personId: string, personName: string, newPubs: Publication[]) => {
      const lastName = personName.trim().split(/\s+/).filter(Boolean).pop()?.toLowerCase();
      const remaining = (data.publications || []).filter((p) => {
        if (p.personId === personId) return false;
        if (!p.personId && lastName && lastName.length >= 2 && p.authors) {
          if (p.authors.toLowerCase().includes(lastName)) return false;
        }
        return true;
      });
      const updatedPublications = [...remaining, ...newPubs];
      const updatedData = { ...data, publications: updatedPublications };
      persist(updatedData, `Synced ${newPubs.length} publication(s) from Google Scholar for ${personName}`);
    },
    [data, persist]
  );

  const reorderItems = useCallback(
    <K extends CollectionKey>(
      collection: K,
      newItems: NonNullable<LabData[K]>
    ) => {
      const updatedData = { ...data, [collection]: newItems };
      persist(updatedData, `Reordered ${collection}`);
    },
    [data, persist]
  );

  const moveItem = useCallback(
    <K extends CollectionKey>(
      collection: K,
      id: string,
      direction: 'up' | 'down'
    ) => {
      const list = [...((data[collection] as any[]) || [])];
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return;

      const [removed] = list.splice(index, 1);
      list.splice(targetIndex, 0, removed);

      const updatedData = { ...data, [collection]: list };
      persist(updatedData, 'Order updated');
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
        reorderItems,
        moveItem,
        setPersonPublications,
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
