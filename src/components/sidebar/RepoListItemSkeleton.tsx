'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const RepoListItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 rounded-md p-2 ml-2">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 flex-1 max-w-[200px]" />
    </div>
  );
};

