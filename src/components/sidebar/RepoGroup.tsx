'use client';

import { useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Repository } from '@/lib/hooks/useRepos';

interface RepoGroupProps {
  group: { name: string; repos: Repository[]; isPersonal: boolean };
  selectedRepos: string[];
  onToggleRepo: (repo: string) => void;
  onToggleOrg: (repos: string[]) => void;
}

export const RepoGroup: React.FC<RepoGroupProps> = ({
  group,
  selectedRepos,
  onToggleRepo,
  onToggleOrg,
}) => {
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const groupRepoNames = group.repos.map((repo) => repo.nameWithOwner);
  const selectedInGroup = groupRepoNames.filter((name) => selectedRepos.includes(name));
  const allSelected = selectedInGroup.length === groupRepoNames.length && groupRepoNames.length > 0;
  const someSelected = selectedInGroup.length > 0 && selectedInGroup.length < groupRepoNames.length;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleOrgToggle = () => {
    onToggleOrg(groupRepoNames);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2 px-2 py-1.5">
        <Checkbox
          ref={checkboxRef}
          checked={allSelected}
          onCheckedChange={handleOrgToggle}
        />
        <div
          className="flex-1 cursor-pointer text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          onClick={handleOrgToggle}
        >
          {group.name}
        </div>
      </div>
      {group.repos.map((repo) => {
        const isSelected = selectedRepos.includes(repo.nameWithOwner);
        const uniqueKey = repo.nameWithOwner;
        return (
          <div
            key={uniqueKey}
            className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent ml-2"
          >
            <Checkbox
              id={uniqueKey}
              checked={isSelected}
              onCheckedChange={() => onToggleRepo(repo.nameWithOwner)}
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
  );
};

