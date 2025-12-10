'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  GitMerge,
  X,
  RotateCcw,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePRActions, PullRequestMergeMethod } from '@/lib/hooks/usePRActions';
import { PullRequest } from '@/lib/hooks/usePRs';
import { useAuth } from '@/lib/hooks/useAuth';

interface PRActionsProps {
  pr: PullRequest;
  onSuccess?: () => void;
}

export const PRActions: React.FC<PRActionsProps> = ({ pr, onSuccess }) => {
  const { token } = useAuth();
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergeMethod, setMergeMethod] = useState<PullRequestMergeMethod>('MERGE');
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [requestChangesDialogOpen, setRequestChangesDialogOpen] = useState(false);
  const [requestChangesText, setRequestChangesText] = useState('');

  const { approve, requestChanges, comment, merge, close, reopen, loading } = usePRActions({
    pullRequestId: pr.id,
    owner: pr.repository.owner.login,
    name: pr.repository.name,
    number: pr.number,
    onSuccess: () => {
      onSuccess?.();
      setCommentDialogOpen(false);
      setRequestChangesDialogOpen(false);
      setMergeDialogOpen(false);
      setCommentText('');
      setRequestChangesText('');
    },
    onError: (error) => {
      console.error('PR action error:', error);
      toast.error('Action failed', {
        description: error.message || 'An error occurred while performing this action',
      });
    },
  });

  const handleApprove = async () => {
    try {
      await approve();
      toast.success('PR approved');
    } catch (error) {
      // Error toast handled by onError callback
    }
  };

  const handleRequestChanges = async () => {
    if (!requestChangesText.trim()) {
      return;
    }
    try {
      await requestChanges(requestChangesText);
      toast.success('Changes requested');
    } catch (error) {
      // Error toast handled by onError callback
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) {
      return;
    }
    try {
      await comment(commentText);
      toast.success('Comment added');
    } catch (error) {
      // Error toast handled by onError callback
    }
  };

  const handleMerge = async () => {
    try {
      await merge(mergeMethod);
      toast.success('PR merged successfully');
    } catch (error) {
      // Error toast handled by onError callback
    }
  };

  const handleClose = async () => {
    try {
      await close();
      toast.success('PR closed');
    } catch (error) {
      // Error toast handled by onError callback
    }
  };

  const handleReopen = async () => {
    try {
      await reopen();
      toast.success('PR reopened');
    } catch (error) {
      // Error toast handled by onError callback
    }
  };

  const isClosed = pr.state === 'CLOSED';
  const isMerged = pr.state === 'MERGED';
  const canMerge = !isClosed && !isMerged && pr.statusCheckRollup?.state === 'SUCCESS';

  if (!token) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">PR Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>PR Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!isClosed && !isMerged && (
            <>
              <DropdownMenuItem onClick={handleApprove} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                )}
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setRequestChangesDialogOpen(true)}
                disabled={loading}
              >
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Request Changes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCommentDialogOpen(true)} disabled={loading}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Comment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canMerge && (
                <DropdownMenuSub>
                <DropdownMenuSubTrigger disabled={loading}>
                  <GitMerge className="mr-2 h-4 w-4" />
                  Merge PR
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setMergeMethod('MERGE');
                      setMergeDialogOpen(true);
                    }}
                  >
                    Create merge commit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setMergeMethod('SQUASH');
                      setMergeDialogOpen(true);
                    }}
                  >
                    Squash and merge
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setMergeMethod('REBASE');
                      setMergeDialogOpen(true);
                    }}
                  >
                    Rebase and merge
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              )}
              <DropdownMenuItem onClick={handleClose} disabled={loading} variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Close PR
              </DropdownMenuItem>
            </>
          )}
          {isClosed && !isMerged && (
            <DropdownMenuItem onClick={handleReopen} disabled={loading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reopen PR
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Comment Dialog */}
      <AlertDialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Add a comment to this pull request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <textarea
              className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Write your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              disabled={loading}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComment} disabled={loading || !commentText.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Comment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request Changes Dialog */}
      <AlertDialog open={requestChangesDialogOpen} onOpenChange={setRequestChangesDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Request changes to this pull request. This will block merging until changes are made.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <textarea
              className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Explain what changes are needed..."
              value={requestChangesText}
              onChange={(e) => setRequestChangesText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              disabled={loading}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRequestChanges}
              disabled={loading || !requestChangesText.trim()}
              className="bg-red-500 hover:bg-red-600"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Request Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Dialog */}
      <AlertDialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Pull Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to merge this pull request using{' '}
              <strong>
                {mergeMethod === 'MERGE'
                  ? 'merge commit'
                  : mergeMethod === 'SQUASH'
                  ? 'squash and merge'
                  : 'rebase and merge'}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMerge} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Merge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

