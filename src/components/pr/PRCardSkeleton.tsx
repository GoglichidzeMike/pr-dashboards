'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const PRCardSkeleton: React.FC = () => {
  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Badges and repo link */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            
            {/* Title */}
            <Skeleton className="h-5 w-full max-w-md mb-2" />
            
            {/* Metadata row */}
            <div className="flex items-center gap-4 flex-wrap">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          </div>
          
          {/* Avatar */}
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};

