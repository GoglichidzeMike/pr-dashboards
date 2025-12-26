'use client';

import { useState, useMemo, useCallback } from 'react';
import { useFilter } from '@/contexts/FilterContext';
import { useRepos } from '@/lib/hooks/useRepos';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, CheckSquare, Square } from 'lucide-react';
import { RepoGroupSkeleton } from './RepoGroupSkeleton';
import { RepoGroup } from './RepoGroup';
import { Repository } from '@/lib/hooks/useRepos';

interface RepoGroup {
  name: string;
  repos: Repository[];
  isPersonal: boolean;
}

export const RepoFilter: React.FC = () => {
  const { filterType, selectedRepos, toggleRepo, deselectAllRepos } = useFilter();
  const { personalRepos, organizations, allRepos, viewerLogin, loading } = useRepos();
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Filter and group repos based on selected organization filter and search query
   */
  const groupedRepos = useMemo((): RepoGroup[] => {
    let repos = allRepos;

    if (filterType === 'personal') {
      repos = personalRepos;
    } else if (filterType === 'organizations') {
      repos = allRepos.filter((repo) => repo.owner.login !== viewerLogin);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      repos = repos.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.nameWithOwner.toLowerCase().includes(query)
      );
    }

    const groups: RepoGroup[] = [];
    const orgLogins = new Set(organizations.map((org) => org.login));
    const sortedOrgs = [...organizations].sort((a, b) => a.login.localeCompare(b.login));
    const reposInOrgs = new Set<string>();

    sortedOrgs.forEach((org) => {
      const orgRepos = repos.filter((repo) => {
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

    const personal = repos.filter((repo) => {
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
  }, [allRepos, personalRepos, organizations, filterType, viewerLogin, searchQuery]);

  const allFilteredRepos = useMemo(
    () => groupedRepos.flatMap((group) => group.repos),
    [groupedRepos]
  );

  const allSelected = useMemo(
    () =>
      allFilteredRepos.length > 0 &&
      allFilteredRepos.every((repo) => selectedRepos.includes(repo.nameWithOwner)),
    [allFilteredRepos, selectedRepos]
  );

  /**
   * Toggle selection for all repos in a specific organization/group
   */
  const handleToggleOrg = useCallback(
    (repoNames: string[]) => {
      const selectedInGroup = repoNames.filter((name) => selectedRepos.includes(name));
      const allInGroupSelected = selectedInGroup.length === repoNames.length;

      repoNames.forEach((repoName) => {
        if (allInGroupSelected) {
          if (selectedRepos.includes(repoName)) {
            toggleRepo(repoName);
          }
        } else {
          if (!selectedRepos.includes(repoName)) {
            toggleRepo(repoName);
          }
        }
      });
    },
    [selectedRepos, toggleRepo]
  );

  /**
   * Toggle selection for all filtered repos
   */
  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      allFilteredRepos.forEach((repo) => {
        if (selectedRepos.includes(repo.nameWithOwner)) {
          toggleRepo(repo.nameWithOwner);
        }
      });
    } else {
      allFilteredRepos.forEach((repo) => {
        if (!selectedRepos.includes(repo.nameWithOwner)) {
          toggleRepo(repo.nameWithOwner);
        }
      });
    }
  }, [allSelected, allFilteredRepos, selectedRepos, toggleRepo]);

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
            {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
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
      <ScrollArea className="h-[500px] rounded-md border">
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
              <RepoGroup
                key={group.name}
                group={group}
                selectedRepos={selectedRepos}
                onToggleRepo={toggleRepo}
                onToggleOrg={handleToggleOrg}
              />
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
