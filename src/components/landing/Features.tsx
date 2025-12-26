import { GitPullRequest, Bell, BarChart3, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Features: React.FC = () => {
  const features = [
    {
      icon: GitPullRequest,
      title: 'Unified Dashboard',
      description: 'View all your PRs across multiple repos and organizations in one place',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Automatic polling keeps your PR list fresh with the latest changes',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get notified when PRs need your attention or when reviews are requested',
    },
    {
      icon: BarChart3,
      title: 'PR Insights',
      description: 'Track review status, CI/CD checks, and merge readiness at a glance',
    },
  ];

  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

