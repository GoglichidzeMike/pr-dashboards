'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { PRList } from '@/components/pr/PRList';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { RefreshControl } from '@/components/sidebar/RefreshControl';
import { usePRs } from '@/lib/hooks/usePRs';
import { useFilter } from '@/contexts/FilterContext';
import { getPreferences } from '@/lib/storage/preferences';

export default function Home() {
  const { logout } = useAuth();
  const { selectedRepos } = useFilter();
  const preferences = getPreferences();
  const pollInterval = preferences.pollingInterval || 60000;
  const { refetch } = usePRs(selectedRepos, pollInterval);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
            <h1 className="text-2xl font-bold">GitHub PR Dashboard</h1>
            <div className="flex items-center gap-2">
              <RefreshControl onRefresh={() => refetch()} />
              <ThemeToggle />
              <Button variant="outline" size="default" onClick={logout} className='cursor-pointer'>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
          <PRList />
        </main>
      </div>
    </ProtectedRoute>
  );
}
