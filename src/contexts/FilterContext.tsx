'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getSelectedRepos, setSelectedRepos, getPreferences, savePreferences } from '@/lib/storage/preferences';

export type FilterType = 'all' | 'personal' | 'organizations'; // 'all', 'personal', or 'organizations'

interface FilterContextType {
  // Organization filter
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  
  // Repository selection
  selectedRepos: string[];
  toggleRepo: (repo: string) => void;
  selectAllRepos: () => void;
  deselectAllRepos: () => void;
  
  // PR filters
  showDrafts: boolean;
  setShowDrafts: (show: boolean) => void;
  
  // Review status filter
  reviewStatus: 'all' | 'approved' | 'changes_requested' | 'pending';
  setReviewStatus: (status: 'all' | 'approved' | 'changes_requested' | 'pending') => void;
  
  // CI status filter
  ciStatus: 'all' | 'passing' | 'failing' | 'pending';
  setCiStatus: (status: 'all' | 'passing' | 'failing' | 'pending') => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filterType, setFilterTypeState] = useState<FilterType>('all');
  const [selectedRepos, setSelectedReposState] = useState<string[]>(getSelectedRepos());
  const [showDrafts, setShowDrafts] = useState(true);
  const [reviewStatus, setReviewStatus] = useState<'all' | 'approved' | 'changes_requested' | 'pending'>('all');
  const [ciStatus, setCiStatus] = useState<'all' | 'passing' | 'failing' | 'pending'>('all');

  // Load preferences on mount
  useEffect(() => {
    const prefs = getPreferences();
    if (prefs.selectedRepos.length > 0) {
      setSelectedReposState(prefs.selectedRepos);
    }
  }, []);

  const setFilterType = useCallback((type: FilterType) => {
    setFilterTypeState(type);
  }, []);

  const toggleRepo = useCallback((repo: string) => {
    setSelectedReposState((prev) => {
      const newRepos = prev.includes(repo)
        ? prev.filter((r) => r !== repo)
        : [...prev, repo];
      setSelectedRepos(newRepos);
      return newRepos;
    });
  }, []);

  const selectAllRepos = useCallback(() => {
    // This will be called with available repos from useRepos
    // For now, just a placeholder
  }, []);

  const deselectAllRepos = useCallback(() => {
    setSelectedReposState([]);
    setSelectedRepos([]);
  }, []);

  const value: FilterContextType = {
    filterType,
    setFilterType,
    selectedRepos,
    toggleRepo,
    selectAllRepos,
    deselectAllRepos,
    showDrafts,
    setShowDrafts,
    reviewStatus,
    setReviewStatus,
    ciStatus,
    setCiStatus,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

