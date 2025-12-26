'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AccountSection } from '@/components/settings/AccountSection';
import { BillingSection } from '@/components/settings/BillingSection';
import { PreferencesSection } from '@/components/settings/PreferencesSection';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <AccountSection />
            <BillingSection />
            <PreferencesSection />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
