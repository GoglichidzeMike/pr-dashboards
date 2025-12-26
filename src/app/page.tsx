'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { PRList } from '@/components/pr/PRList';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { RefreshControl } from '@/components/sidebar/RefreshControl';
import { usePRs } from '@/lib/hooks/usePRs';
import { useFilter } from '@/contexts/FilterContext';
import { getPreferences } from '@/lib/storage/preferences';
import Link from 'next/link';

function Dashboard() {
  const { logout } = useAuth();
  const { selectedRepos } = useFilter();
  const preferences = getPreferences();
  const pollInterval = preferences.pollingInterval || 60000;
  const { refetch, loading } = usePRs(selectedRepos, pollInterval);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
          <h1 className="text-2xl font-bold">GitHub PR Dashboard</h1>
          <div className="flex items-center gap-2">
            <RefreshControl onRefresh={() => refetch()} loading={loading} />
            <Link href="/settings">
              <Button size="sm" variant="default">
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
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
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Pricing />
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LandingPage />;
}
