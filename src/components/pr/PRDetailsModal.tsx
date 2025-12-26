'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, GitBranch } from 'lucide-react';
import { usePRDetails } from '@/lib/hooks/usePRDetails';
import { PRDescription } from './PRDescription';
import { PRComments } from './PRComments';
import { PRFiles } from './PRFiles';
import { PRTimeline } from './PRTimeline';
import { PRActions } from './PRActions';
import { PullRequest } from '@/lib/hooks/usePRs';
import { Skeleton } from '@/components/ui/skeleton';

interface PRDetailsModalProps {
  pr: PullRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PRDetailsModal: React.FC<PRDetailsModalProps> = ({ pr, open, onOpenChange }) => {
  const [owner, name, number] = pr
    ? [pr.repository.owner.login, pr.repository.name, pr.number]
    : [null, null, null];

  const {
    pr: prDetails,
    loading,
    error,
    refetch,
  } = usePRDetails(owner || '', name || '', number || 0, !!(owner && name && number));

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  if (!pr) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl! max-h-[80vh] w-full h-full overflow-hidden flex flex-col transition-all duration-300 ease-in-out">
        <DialogHeader className="shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl mb-2">{pr.title}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {pr.isDraft && <Badge variant="secondary">Draft</Badge>}
                <a
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline flex items-center gap-1 text-muted-foreground"
                >
                  {pr.repository.nameWithOwner}#{pr.number}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <GitBranch className="h-3 w-3" />
                  <span>
                    {prDetails?.headRefName || '...'} → {prDetails?.baseRefName || '...'}
                  </span>
                </div>
                {prDetails && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-600 dark:text-green-400">
                      +{prDetails.additions}
                    </span>
                    <span className="text-red-600 dark:text-red-400">-{prDetails.deletions}</span>
                    <span>{prDetails.changedFiles} files</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 pr-4">
              <PRActions pr={pr} onSuccess={() => refetch()} />
              <Avatar className="h-10 w-10">
                <AvatarImage src={pr.author.avatarUrl} alt={pr.author.login} />
                <AvatarFallback>{pr.author.login[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden transition-all duration-300 ease-in-out">
          {loading && !prDetails ? (
            <div className="h-full overflow-y-auto space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : error ? (
            <div className="h-full overflow-y-auto text-center py-8 text-destructive">
              <p>Error loading PR details: {error.message}</p>
            </div>
          ) : prDetails ? (
            <Tabs defaultValue="description" className="h-full flex flex-col min-h-0 w-full">
              <TabsList className="shrink-0 w-full">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="comments">
                  Comments
                  {prDetails.comments.totalCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {prDetails.comments.totalCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="files">
                  Files
                  {prDetails.files.nodes.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {prDetails.files.nodes.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-y-auto mt-4 min-h-0">
                <TabsContent value="description" className="mt-0">
                  <PRDescription pr={prDetails} />
                </TabsContent>
                <TabsContent value="comments" className="mt-0">
                  <PRComments
                    comments={prDetails.comments.nodes}
                    pullRequestId={prDetails.id}
                    owner={owner || ''}
                    name={name || ''}
                    number={number || 0}
                    onCommentAdded={() => refetch()}
                  />
                </TabsContent>
                <TabsContent value="files" className="mt-0">
                  <PRFiles files={prDetails.files.nodes} prUrl={prDetails.url} />
                </TabsContent>
                <TabsContent value="timeline" className="mt-0">
                  <PRTimeline timelineItems={prDetails.timelineItems.nodes} />
                </TabsContent>
              </div>
            </Tabs>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// https://github.com/airaia-skrib/frontend/pull/395/changes#diff-71b152e9c1b3bf6f6849cf0309c24593347163666a373475019b65cd11a30088
// https://github.com/airaia-skrib/frontend/pull/395/changes#diff-c3JjL3V0aWxzL2ZkeFBhcnNlci5qcw
