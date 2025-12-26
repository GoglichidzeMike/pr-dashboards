import { Button } from '@/components/ui/button';
import { LogOut, Settings, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { RefreshControl } from '@/components/sidebar/RefreshControl';
import Link from 'next/link';
import { Separator } from '@radix-ui/react-separator';
import { usePRs } from '@/lib/hooks/usePRs';
import { useFilter } from '@/contexts/FilterContext';
import { getPreferences } from '@/lib/storage/preferences';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();
  const { selectedRepos } = useFilter();
  const preferences = getPreferences();
  const pollInterval = preferences.pollingInterval || 60000;
  const { refetch, loading } = usePRs(selectedRepos, pollInterval);

  return (
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
        <Separator orientation="vertical" className="h-4 w-px bg-border" />
        <Link href="/settings">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
        <ThemeToggle />
        <Separator orientation="vertical" className="h-4 w-px bg-border" />
        <Button variant="outline" size="default" onClick={logout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
