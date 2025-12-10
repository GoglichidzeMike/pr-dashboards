'use client';

import React from 'react';
import { PRCardSkeleton } from './PRCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

interface PRGroupSkeletonProps {
  cardCount?: number;
}

export const PRGroupSkeleton: React.FC<PRGroupSkeletonProps> = ({ cardCount = 3 }) => {
  return (
    <div className="space-y-2">
      {/* Group header */}
      <div className="flex items-center gap-2 pb-1 border-b">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      
      {/* PR cards */}
      <div className="space-y-2 pl-2">
        {Array.from({ length: cardCount }).map((_, idx) => (
          <PRCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
};

