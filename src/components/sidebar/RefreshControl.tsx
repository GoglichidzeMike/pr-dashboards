'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { savePreferences, getPreferences } from '@/lib/storage/preferences';

const POLL_INTERVALS = [
  { value: 30000, label: '30s' },
  { value: 60000, label: '1m' },
  { value: 120000, label: '2m' },
  { value: 300000, label: '5m' },
  { value: 0, label: 'Manual' },
] as const;

interface RefreshControlProps {
  onRefresh?: () => void;
  onIntervalChange?: (interval: number) => void;
  loading?: boolean;
}

export const RefreshControl: React.FC<RefreshControlProps> = ({
  onRefresh,
  onIntervalChange,
  loading,
}) => {
  const [interval, setInterval] = useState(() => {
    const prefs = getPreferences();
    return prefs.pollingInterval || 60000;
  });

  const handleIntervalChange = (value: string) => {
    const newInterval = parseInt(value, 10);
    setInterval(newInterval);
    savePreferences({ pollingInterval: newInterval });
    onIntervalChange?.(newInterval);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={interval.toString()} onValueChange={handleIntervalChange}>
        <SelectTrigger className="w-[100px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {POLL_INTERVALS.map(({ value, label }) => (
            <SelectItem key={value} value={value.toString()}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {onRefresh && (
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          title="Refresh now"
          className="h-9 w-9"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};
