'use client';

import { FileText, Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PRDetailsFile } from '@/lib/hooks/usePRDetails.old';
import { useEffect, useState } from 'react';
import { usePRFileUrl } from '@/lib/hooks/usePRFileUrl';

interface PRFilesProps {
  files: PRDetailsFile[];
  prUrl: string;
}

export const PRFiles: React.FC<PRFilesProps> = ({ files, prUrl }) => {
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
        return <Badge variant="default" className="bg-green-500 min-w-[75px]">Added</Badge>;
      case 'DELETED':
        return <Badge variant="destructive" className=' min-w-[75px]'>Deleted</Badge>;
      case 'MODIFIED':
        return <Badge variant="secondary" className=' min-w-[75px]'>Modified</Badge>;
      case 'RENAMED':
        return <Badge variant="outline" className=' min-w-[75px]'>Renamed</Badge>;
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
          <FileLink
            key={`${file.path}-${index}`}
            file={file}
            prUrl={prUrl}
            getChangeTypeBadge={getChangeTypeBadge}
          />
        ))}
      </div>
    </div>
  );
};

interface FileLinkProps {
  file: PRDetailsFile;
  prUrl: string;
  getChangeTypeBadge: (changeType: string) => React.ReactNode;
}

const FileLink: React.FC<FileLinkProps> = ({ file, prUrl, getChangeTypeBadge }) => {
  const fileUrl = usePRFileUrl(file.path, prUrl);


  return (
    <div className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <a
          href={fileUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-mono truncate hover:text-primary hover:underline flex-1 min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          {file.path}
        </a>
        <div className="flex items-center gap-3 text-sm shrink-0">
          {file.additions > 0 && (
            <span className="text-green-600 dark:text-green-400">+{file.additions}</span>
          )}
          {file.deletions > 0 && (
            <span className="text-red-600 dark:text-red-400">-{file.deletions}</span>
          )}
        </div>
        {getChangeTypeBadge(file.changeType)}
      </div>
    </div>
  );
};