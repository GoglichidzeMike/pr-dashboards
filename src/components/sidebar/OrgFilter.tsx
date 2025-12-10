'use client';

import { useFilter } from '@/contexts/FilterContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRepos } from '@/lib/hooks/useRepos';

export const OrgFilter: React.FC = () => {
  const { filterType, setFilterType } = useFilter();
  const { organizations, personalRepos } = useRepos();

  const hasPersonalRepos = personalRepos.length > 0;
  const hasOrgs = organizations.length > 0;

  return (
    <div className="space-y-2">
      <Label htmlFor="org-filter" className="text-sm">Organization</Label>
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger id="org-filter" className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {hasOrgs && <SelectItem value="organizations">Organizations</SelectItem>}
          {hasPersonalRepos && <SelectItem value="personal">Personal</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );
};

