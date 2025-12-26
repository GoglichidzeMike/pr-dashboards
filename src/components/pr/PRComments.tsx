'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PRDetailsComment } from '@/lib/hooks/usePRDetails.old';
import { usePRActions } from '@/lib/hooks/usePRActions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PRCommentsProps {
  comments: PRDetailsComment[];
  pullRequestId: string;
  owner: string;
  name: string;
  number: number;
  onCommentAdded?: () => void;
}

export const PRComments: React.FC<PRCommentsProps> = ({
  comments,
  pullRequestId,
  owner,
  name,
  number,
  onCommentAdded,
}) => {
  const [commentText, setCommentText] = useState('');
  const { comment, loading } = usePRActions({
    pullRequestId,
    owner,
    name,
    number,
    onSuccess: () => {
      setCommentText('');
      onCommentAdded?.();
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error('Failed to add comment', {
        description: error.message || 'An error occurred while adding your comment',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || loading) {
      return;
    }
    try {
      await comment(commentText);
    } catch {
      // Error handled by onError callback
    }
  };

  const filteredComments = comments.filter((comment) => !comment.isMinimized);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No comments yet.</p>
          </div>
        ) : (
          filteredComments.map((comment) => {
            const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
            return (
              <div key={comment.id} className="flex gap-3 pb-4 border-b last:border-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={comment.author.avatarUrl} alt={comment.author.login} />
                  <AvatarFallback className="text-xs">
                    {comment.author.login[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">{comment.author.login}</span>
                    {comment.author.name && (
                      <span className="text-xs text-muted-foreground">{comment.author.name}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                  </div>
                  {comment.bodyHTML ? (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none pr-comment"
                      dangerouslySetInnerHTML={{ __html: comment.bodyHTML }}
                    />
                  ) : comment.bodyText ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                      {comment.bodyText}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No content.</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t pt-4 mt-4 shrink-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={loading}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || !commentText.trim()}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Comment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};