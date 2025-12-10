'use client';

import { PRDetailsComment } from '@/lib/hooks/usePRDetails';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface PRCommentsProps {
  comments: PRDetailsComment[];
}

export const PRComments: React.FC<PRCommentsProps> = ({ comments }) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No comments yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments
        .filter((comment) => !comment.isMinimized)
        .map((comment) => {
          const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
          return (
            <div key={comment.id} className="flex gap-3 pb-4 border-b last:border-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
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
        })}
    </div>
  );
};

