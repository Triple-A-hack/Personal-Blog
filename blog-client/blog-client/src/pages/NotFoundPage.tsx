import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
        action={
          <Link to="/" className={buttonClasses('primary')}>
            Back to home
          </Link>
        }
      />
    </div>
  );
}
