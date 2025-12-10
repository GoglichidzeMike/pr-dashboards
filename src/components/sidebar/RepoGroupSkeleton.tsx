'use client';

import React from 'react';
import { RepoListItemSkeleton } from './RepoListItemSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

interface RepoGroupSkeletonProps {
  itemCount?: number;
}

export const RepoGroupSkeleton: React.FC<RepoGroupSkeletonProps> = ({ itemCount = 3 }) => {
  return (
    <div className="space-y-1">
      {/* Group header */}
      <Skeleton className="h-4 w-24 ml-2 mb-1" />
      
      {/* Repo items */}
      {Array.from({ length: itemCount }).map((_, idx) => (
        <RepoListItemSkeleton key={idx} />
      ))}
    </div>
  );
};

