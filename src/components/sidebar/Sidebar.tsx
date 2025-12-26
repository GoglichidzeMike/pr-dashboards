'use client';

import { Separator } from '@/components/ui/separator';
import { OrgFilter } from './OrgFilter';
import { RepoFilter } from './RepoFilter';
import { useFilter } from '@/contexts/FilterContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Sidebar: React.FC = () => {
  const { showDrafts, setShowDrafts, reviewStatus, setReviewStatus, ciStatus, setCiStatus } =
    useFilter();

  return (
    <div className="w-96 border-r bg-background p-4 overflow-y-auto h-screen">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        {/* Organization Filter */}
        <OrgFilter />

        <Separator />

        {/* PR Status Filters - Compact */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor="show-drafts" className="text-sm">
              Show drafts
            </Label>
            <Switch id="show-drafts" checked={showDrafts} onCheckedChange={setShowDrafts} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-status" className="text-sm">
              Review
            </Label>
            <Select value={reviewStatus} onValueChange={setReviewStatus}>
              <SelectTrigger id="review-status" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="changes_requested">Changes Requested</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ci-status" className="text-sm">
              CI Status
            </Label>
            <Select value={ciStatus} onValueChange={setCiStatus}>
              <SelectTrigger id="ci-status" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="passing">Passing</SelectItem>
                <SelectItem value="failing">Failing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Repositories - Keep as is */}
        <RepoFilter />
      </div>
    </div>
  );
};
