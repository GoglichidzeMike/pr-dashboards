import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="py-20 px-4 text-center">
      <h1 className="text-5xl font-bold mb-6">
        Manage Your GitHub PRs
        <br />
        <span className="text-primary">All in One Place</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        A unified dashboard for monitoring pull requests across multiple repositories and organizations.
        Stay on top of reviews, approvals, and merges.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/login">
          <Button size="lg">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="#pricing">
          <Button size="lg" variant="outline">
            View Pricing
          </Button>
        </Link>
      </div>
    </section>
  );
};

