'use client';

import { PRDetails } from '@/lib/hooks/usePRDetails';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PRDescriptionProps {
  pr: PRDetails;
}

export const PRDescription: React.FC<PRDescriptionProps> = ({ pr }) => {
  const timeAgo = formatDistanceToNow(new Date(pr.createdAt), { addSuffix: true });

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 pb-4 border-b">
        <Avatar className="h-10 w-10">
          <AvatarImage src={pr.author.avatarUrl} alt={pr.author.login} />
          <AvatarFallback>{pr.author.login[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{pr.author.login}</span>
            <span className="text-sm text-muted-foreground">opened this {timeAgo}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {pr.headRefName} → {pr.baseRefName}
            </span>
            {pr.additions > 0 || pr.deletions > 0 ? (
              <span>
                +{pr.additions} -{pr.deletions}
              </span>
            ) : null}
            {pr.changedFiles > 0 && <span>{pr.changedFiles} files changed</span>}
          </div>
        </div>
      </div>

      {pr.bodyHTML ? (
        <div
          className="prose prose-sm dark:prose-invert max-w-none pr-description"
          dangerouslySetInnerHTML={{ __html: pr.bodyHTML }}
        />
      ) : pr.bodyText ? (
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
          {pr.bodyText}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No description provided.</p>
      )}
    </div>
  );
};

