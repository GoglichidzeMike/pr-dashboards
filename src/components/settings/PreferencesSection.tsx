'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPreferences, savePreferences } from '@/lib/storage/preferences';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const PreferencesSection: React.FC = () => {
  const [pollingInterval, setPollingInterval] = useState(60000);

  useEffect(() => {
    const prefs = getPreferences();
    setPollingInterval(prefs.pollingInterval || 60000);
  }, []);

  const handlePollingChange = (value: string) => {
    const interval = parseInt(value, 10);
    setPollingInterval(interval);
    savePreferences({ pollingInterval: interval });
    toast.success('Preferences updated');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your dashboard experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="polling-interval">Polling Interval</Label>
          <Select value={pollingInterval.toString()} onValueChange={handlePollingChange}>
            <SelectTrigger id="polling-interval">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10000">10 seconds (Pro only)</SelectItem>
              <SelectItem value="30000">30 seconds</SelectItem>
              <SelectItem value="60000">1 minute</SelectItem>
              <SelectItem value="300000">5 minutes</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            How often to check for PR updates
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


