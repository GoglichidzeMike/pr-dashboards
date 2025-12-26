'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface UpgradeButtonProps {
  className?: string;
  variant?: 'default' | 'outline';
  children?: React.ReactNode;
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({ 
  className, 
  variant = 'default',
  children = 'Upgrade to Pro'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    toast.info('Billing integration coming soon!');
  };

  return (
    <Button 
      onClick={handleUpgrade} 
      disabled={isLoading}
      className={className}
      variant={variant}
    >
      {isLoading ? 'Loading...' : children}
    </Button>
  );
};