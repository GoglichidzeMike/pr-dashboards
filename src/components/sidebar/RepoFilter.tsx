'use client';

import { useMemo, useState } from 'react';
import { useFilter } from '@/contexts/FilterContext';
import { useRepos } from '@/lib/hooks/useRepos';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, CheckSquare, Square } from 'lucide-react';
import { RepoGroupSkeleton } from './RepoGroupSkeleton';

export const RepoFilter: React.FC = () => {
  const { filterType, selectedRepos, toggleRepo, deselectAllRepos } = useFilter();
  const { personalRepos, organizations, allRepos, viewerLogin, loading } = useRepos();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and group repos based on selected organization filter
  const groupedRepos = useMemo(() => {
    let repos = allRepos;

    if (filterType === 'personal') {
      repos = personalRepos;
    } else if (filterType === 'organizations') {
      // Show all organization repos (exclude personal)
      repos = allRepos.filter((repo) => repo.owner.login !== viewerLogin);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      repos = repos.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.nameWithOwner.toLowerCase().includes(query)
      );
    }

    // Group repos by organization
    const groups: Array<{ name: string; repos: typeof repos; isPersonal: boolean }> = [];
    
    // Get all org logins for filtering
    const orgLogins = new Set(organizations.map((org) => org.login));
    
    // Organization repos (sorted alphabetically)
    const sortedOrgs = [...organizations].sort((a, b) => a.login.localeCompare(b.login));
    const reposInOrgs = new Set<string>(); // Track repos that belong to orgs
    
    sortedOrgs.forEach((org) => {
      const orgRepos = repos.filter((repo) => {
        // Repo belongs to this org if owner matches org login
        const belongsToOrg = repo.owner.login === org.login;
        if (belongsToOrg) {
          reposInOrgs.add(repo.nameWithOwner);
        }
        return belongsToOrg;
      });
      if (orgRepos.length > 0) {
        groups.push({ name: org.login, repos: orgRepos, isPersonal: false });
      }
    });

    // Personal repos (at the bottom) - exclude repos that are already in org groups
    const personal = repos.filter((repo) => {
      // Repo is personal if:
      // 1. Owner matches viewer login
      // 2. Owner is NOT an organization
      // 3. Not already placed in an org group
      return (
        repo.owner.login === viewerLogin &&
        !orgLogins.has(repo.owner.login) &&
        !reposInOrgs.has(repo.nameWithOwner)
      );
    });
    if (personal.length > 0) {
      groups.push({ name: 'Personal', repos: personal, isPersonal: true });
    }

    return groups;
  }, [filterType, personalRepos, organizations, allRepos, searchQuery]);

  // Flatten grouped repos for select all logic
  const allFilteredRepos = useMemo(() => {
    return groupedRepos.flatMap((group) => group.repos);
  }, [groupedRepos]);

  // Check if all filtered repos are selected
  const allSelected = allFilteredRepos.length > 0 && allFilteredRepos.every((repo) => selectedRepos.includes(repo.nameWithOwner));
  const someSelected = allFilteredRepos.some((repo) => selectedRepos.includes(repo.nameWithOwner));

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all filtered repos
      allFilteredRepos.forEach((repo) => {
        if (selectedRepos.includes(repo.nameWithOwner)) {
          toggleRepo(repo.nameWithOwner);
        }
      });
    } else {
      // Select all filtered repos
      allFilteredRepos.forEach((repo) => {
        if (!selectedRepos.includes(repo.nameWithOwner)) {
          toggleRepo(repo.nameWithOwner);
        }
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Repositories</Label>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="h-7 px-2"
            title={allSelected ? 'Deselect all' : 'Select all'}
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </Button>
          {selectedRepos.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={deselectAllRepos}
              className="h-7 px-2 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <ScrollArea className="h-[300px] rounded-md border">
        <div className="space-y-1 p-2">
          {loading ? (
            <>
              <RepoGroupSkeleton itemCount={4} />
              <RepoGroupSkeleton itemCount={3} />
              <RepoGroupSkeleton itemCount={2} />
            </>
          ) : groupedRepos.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {searchQuery ? 'No repositories found' : 'No repositories available'}
            </div>
          ) : (
            groupedRepos.map((group) => (
              <div key={group.name} className="space-y-1">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.name}
                </div>
                {group.repos.map((repo) => {
                  const isSelected = selectedRepos.includes(repo.nameWithOwner);
                  const uniqueKey = repo.nameWithOwner; // Use nameWithOwner as unique key
                  return (
                    <div
                      key={uniqueKey}
                      className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent ml-2"
                    >
                      <Checkbox
                        id={uniqueKey}
                        checked={isSelected}
                        onCheckedChange={() => toggleRepo(repo.nameWithOwner)}
                      />
                      <label
                        htmlFor={uniqueKey}
                        className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate">{repo.nameWithOwner}</span>
                          {repo.isPrivate && (
                            <span className="text-xs text-muted-foreground">🔒</span>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      {selectedRepos.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {selectedRepos.length} repository{selectedRepos.length !== 1 ? 'ies' : ''} selected
        </div>
      )}
    </div>
  );
};

