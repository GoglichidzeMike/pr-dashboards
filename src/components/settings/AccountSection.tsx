'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export const AccountSection: React.FC = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.user.get(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your GitHub account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your GitHub account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatarUrl} alt={user?.githubLogin} />
            <AvatarFallback>{user?.githubLogin?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user?.githubLogin}</div>
            <div className="text-sm text-muted-foreground">{user?.email || 'No email'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


