'use client';

import { PRDetailsFile } from '@/lib/hooks/usePRDetails';
import { FileText, Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PRFilesProps {
  files: PRDetailsFile[];
}

export const PRFiles: React.FC<PRFilesProps> = ({ files }) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No files changed.</p>
      </div>
    );
  }

  const totalAdditions = files.reduce((sum, file) => sum + file.additions, 0);
  const totalDeletions = files.reduce((sum, file) => sum + file.deletions, 0);

  const getChangeTypeBadge = (changeType: string) => {
    switch (changeType) {
      case 'ADDED':
        return <Badge variant="default" className="bg-green-500">Added</Badge>;
      case 'DELETED':
        return <Badge variant="destructive">Deleted</Badge>;
      case 'MODIFIED':
        return <Badge variant="secondary">Modified</Badge>;
      case 'RENAMED':
        return <Badge variant="outline">Renamed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Plus className="h-4 w-4" />
            <span>{totalAdditions}</span>
          </div>
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <Minus className="h-4 w-4" />
            <span>{totalDeletions}</span>
          </div>
          <span className="text-muted-foreground">{files.length} files</span>
        </div>
      </div>

      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={`${file.path}-${index}`}
            className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="text-sm font-mono truncate">{file.path}</span>
              {getChangeTypeBadge(file.changeType)}
            </div>
            <div className="flex items-center gap-3 text-sm flex-shrink-0">
              {file.additions > 0 && (
                <span className="text-green-600 dark:text-green-400">+{file.additions}</span>
              )}
              {file.deletions > 0 && (
                <span className="text-red-600 dark:text-red-400">-{file.deletions}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

