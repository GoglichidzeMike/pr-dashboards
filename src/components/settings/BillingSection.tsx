'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const BillingSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const isPro = false;
  const isFree = true;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });

      const data = await response.json();

      if (data.url) {
        toast.info('Billing integration coming soon!');
        window.location.href = data.url;
      } else {
        toast.info('Billing integration coming soon!');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/billing/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        toast.info('Billing portal coming soon!');
        window.location.href = data.url;
      } else {
        toast.info('Billing portal coming soon!');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Current Plan</span>
              {isPro && <Badge variant="default">Pro</Badge>}
              {isFree && <Badge variant="outline">Free</Badge>}
            </div>
            {isFree && (
              <div className="text-sm text-muted-foreground">
                Up to 5 repositories, 30s polling
              </div>
            )}
          </div>
          {isFree && (
            <Button onClick={handleUpgrade} disabled={isLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
          )}
          {isPro && (
            <Button onClick={handleManageSubscription} disabled={isLoading} variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          )}
        </div>

        {isPro && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-medium mb-2">Pro Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Unlimited repositories</li>
              <li>✓ 10s minimum polling</li>
              <li>✓ Email notifications</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
        )}

        {isFree && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-medium mb-2">Upgrade to Pro for:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Unlimited repositories</li>
              <li>✓ 10s minimum polling (6x faster)</li>
              <li>✓ Email notifications</li>
              <li>✓ Priority support</li>
            </ul>
            <div className="mt-4 text-sm font-medium">Only $8/month</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


