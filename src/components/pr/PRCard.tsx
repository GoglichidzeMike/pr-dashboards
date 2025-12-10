'use client';

import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, GitBranch, MessageSquare, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PullRequest } from '@/lib/hooks/usePRs';
import { cn } from '@/lib/utils';

interface PRCardProps {
  pr: PullRequest;
  onClick?: () => void;
}

export const PRCard: React.FC<PRCardProps> = memo(({ pr, onClick }) => {
  const timeAgo = formatDistanceToNow(new Date(pr.updatedAt), { addSuffix: true });

  // Determine review status
  const reviews = pr.reviews.nodes || [];
  const approvedReviews = reviews.filter((r) => r.state === 'APPROVED');
  const changesRequestedReviews = reviews.filter((r) => r.state === 'CHANGES_REQUESTED');
  const pendingReviews = pr.reviewRequests.nodes.length > 0;

  // Determine CI status
  const ciState = pr.statusCheckRollup?.state || 'PENDING';
  const ciContexts = pr.statusCheckRollup?.contexts?.nodes || [];

  // Get review status badge
  const getReviewBadge = () => {
    if (approvedReviews.length > 0 && changesRequestedReviews.length === 0) {
      return <Badge variant="default" className="bg-green-500">Approved</Badge>;
    }
    if (changesRequestedReviews.length > 0) {
      return <Badge variant="destructive">Changes Requested</Badge>;
    }
    if (pendingReviews) {
      return <Badge variant="secondary">Pending Review</Badge>;
    }
    return null;
  };

  // Get CI status icon
  const getCiIcon = () => {
    switch (ciState) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'FAILURE':
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on a link or button
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    onClick?.();
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow py-4 cursor-pointer" 
      onClick={handleCardClick}
    >
      <CardContent className='px-4'>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {pr.isDraft && <Badge variant="secondary" className="text-xs">Draft</Badge>}
              {getReviewBadge()}
              <a
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium hover:underline flex items-center gap-1 text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                {pr.repository.nameWithOwner}#{pr.number}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <h3 className="text-base font-semibold mb-2">{pr.title}</h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                <span>{pr.repository.name}</span>
              </div>
              {pr.comments.totalCount > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{pr.comments.totalCount}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                {getCiIcon()}
                <span className="capitalize">{ciState.toLowerCase()}</span>
              </div>
              {pr.labels.nodes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {pr.labels.nodes.slice(0, 3).map((label) => (
                    <Badge
                      key={label.id}
                      variant="outline"
                      className="text-xs py-0"
                      style={{
                        borderColor: `#${label.color}`,
                        backgroundColor: `#${label.color}20`,
                      }}
                    >
                      {label.name}
                    </Badge>
                  ))}
                  {pr.labels.nodes.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{pr.labels.nodes.length - 3}</span>
                  )}
                </div>
              )}
              {(reviews.length > 0 || pr.reviewRequests.nodes.length > 0) && (
                <>
                  {approvedReviews.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">✓</span>
                      <div className="flex -space-x-1">
                        {approvedReviews.slice(0, 3).map((review) => (
                          <Avatar key={review.id} className="h-5 w-5 border border-background">
                            <AvatarImage src={review.author.avatarUrl} alt={review.author.login} />
                            <AvatarFallback className="text-[10px]">{review.author.login[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  )}
                  {pr.reviewRequests.nodes.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">?</span>
                      <div className="flex -space-x-1">
                        {pr.reviewRequests.nodes.slice(0, 3).map((request, idx) => {
                          const reviewer = request.requestedReviewer;
                          const name = reviewer.login || reviewer.name || 'Unknown';
                          return (
                            <Avatar key={idx} className="h-5 w-5 border border-background">
                              <AvatarFallback className="text-[10px]">{name[0]}</AvatarFallback>
                            </Avatar>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="ml-auto text-xs">
                {timeAgo}
              </div>
            </div>
          </div>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={pr.author.avatarUrl} alt={pr.author.login} />
            <AvatarFallback className="text-xs">{pr.author.login[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Only re-render if PR data actually changed
  return (
    prevProps.pr.id === nextProps.pr.id &&
    prevProps.pr.updatedAt === nextProps.pr.updatedAt &&
    prevProps.pr.reviews.nodes.length === nextProps.pr.reviews.nodes.length &&
    prevProps.pr.reviewRequests.nodes.length === nextProps.pr.reviewRequests.nodes.length &&
    prevProps.pr.statusCheckRollup?.state === nextProps.pr.statusCheckRollup?.state
  );
});

PRCard.displayName = 'PRCard';

