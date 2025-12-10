'use client';

import { PRDetailsTimelineItem } from '@/lib/hooks/usePRDetails';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GitCommit, MessageSquare, CheckCircle2, XCircle, Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PRTimelineProps {
  timelineItems: PRDetailsTimelineItem[];
}

export const PRTimeline: React.FC<PRTimelineProps> = ({ timelineItems }) => {
  if (timelineItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No timeline events.</p>
      </div>
    );
  }

  const getTimelineIcon = (item: PRDetailsTimelineItem) => {
    switch (item.__typename) {
      case 'PullRequestCommit':
        return <GitCommit className="h-4 w-4 text-blue-500" />;
      case 'PullRequestReview':
        if (item.state === 'APPROVED') {
          return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        }
        if (item.state === 'CHANGES_REQUESTED') {
          return <XCircle className="h-4 w-4 text-red-500" />;
        }
        return <MessageSquare className="h-4 w-4 text-yellow-500" />;
      case 'IssueComment':
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
      case 'LabeledEvent':
        return <Tag className="h-4 w-4 text-blue-500" />;
      case 'UnlabeledEvent':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getTimelineContent = (item: PRDetailsTimelineItem) => {
    switch (item.__typename) {
      case 'PullRequestCommit':
        return (
          <div>
            <div className="font-mono text-sm">{item.commit?.messageHeadline}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {item.commit?.author.user?.login || item.commit?.author.name}
            </div>
          </div>
        );
      case 'PullRequestReview':
        return (
          <div>
            <div className="font-semibold text-sm capitalize">{item.state?.toLowerCase()} review</div>
            {item.author && (
              <div className="text-xs text-muted-foreground mt-1">by {item.author.login}</div>
            )}
            {item.body && (
              <div className="text-sm mt-2 prose prose-sm dark:prose-invert max-w-none">
                {item.body}
              </div>
            )}
          </div>
        );
      case 'IssueComment':
        return (
          <div>
            <div className="text-sm">
              {item.author && <span className="font-semibold">{item.author.login}</span>} commented
            </div>
            {item.body && (
              <div className="text-sm mt-2 prose prose-sm dark:prose-invert max-w-none">
                {item.body}
              </div>
            )}
          </div>
        );
      case 'LabeledEvent':
        return (
          <div>
            <div className="text-sm">
              Label <Badge style={{ backgroundColor: `#${item.label?.color}20`, borderColor: `#${item.label?.color}` }}>
                {item.label?.name}
              </Badge> added
            </div>
          </div>
        );
      case 'UnlabeledEvent':
        return (
          <div>
            <div className="text-sm">
              Label <Badge variant="outline">{item.label?.name}</Badge> removed
            </div>
          </div>
        );
      case 'ClosedEvent':
        return (
          <div>
            <div className="text-sm">
              {item.actor && <span className="font-semibold">{item.actor.login}</span>} closed this PR
            </div>
          </div>
        );
      case 'MergedEvent':
        return (
          <div>
            <div className="text-sm">
              {item.actor && <span className="font-semibold">{item.actor.login}</span>} merged this PR
            </div>
          </div>
        );
      default:
        return <div className="text-sm text-muted-foreground">{item.__typename}</div>;
    }
  };

  return (
    <div className="space-y-4">
      {timelineItems.map((item, index) => {
        const timeAgo = item.createdAt
          ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
          : null;
        const author = item.author || item.actor || item.commit?.author.user;

        return (
          <div key={`${item.__typename}-${index}`} className="flex gap-3 pb-4 border-b last:border-0">
            <div className="flex-shrink-0 mt-1">
              {author ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={author.avatarUrl} alt={author.login || 'Unknown'} />
                  <AvatarFallback className="text-xs">
                    {(author.login || '?')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  {getTimelineIcon(item)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getTimelineContent(item)}
                {timeAgo && <span className="text-xs text-muted-foreground ml-auto">{timeAgo}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

