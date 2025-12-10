/**
 * User preferences storage utilities
 * Persists filter selections and preferences to localStorage
 */

const PREFERENCES_KEY = 'github_pr_dashboard_preferences';

interface UserPreferences {
  selectedRepos: string[]; // Array of "owner/name" strings
  lastRefreshTime?: number;
  pollingInterval?: number;
}

const defaultPreferences: UserPreferences = {
  selectedRepos: [],
  pollingInterval: 60000, // 60 seconds default
};

/**
 * Get user preferences from localStorage
 */
export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return defaultPreferences;
  }

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to parse preferences:', error);
  }

  return defaultPreferences;
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

/**
 * Get selected repositories
 */
export function getSelectedRepos(): string[] {
  return getPreferences().selectedRepos;
}

/**
 * Set selected repositories
 */
export function setSelectedRepos(repos: string[]): void {
  savePreferences({ selectedRepos: repos });
}

/**
 * Add a repository to selected list
 */
export function addSelectedRepo(repo: string): void {
  const current = getSelectedRepos();
  if (!current.includes(repo)) {
    setSelectedRepos([...current, repo]);
  }
}

/**
 * Remove a repository from selected list
 */
export function removeSelectedRepo(repo: string): void {
  const current = getSelectedRepos();
  setSelectedRepos(current.filter((r) => r !== repo));
}

/**
 * Clear all preferences
 */
export function clearPreferences(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(PREFERENCES_KEY);
}

