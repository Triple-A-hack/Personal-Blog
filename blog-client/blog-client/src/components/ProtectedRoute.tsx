import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types/blog';

interface ProtectedRouteProps {
  /** Roles allowed through. Defaults to the dashboard roles. */
  allowedRoles?: readonly Role[];
  children?: ReactNode;
}

const DASHBOARD_ROLES: readonly Role[] = ['ADMIN', 'AUTHOR'];

/** Route guard: redirects anonymous users to /login and blocks roles outside `allowedRoles`. */
export function ProtectedRoute({ allowedRoles = DASHBOARD_ROLES, children }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4">
        <div className="w-full">
          <EmptyState
            icon={ShieldAlert}
            title="You don't have access to this area"
            description="Your account doesn't have the role required to view this page. Contact an administrator if you think this is a mistake."
            action={
              <Link to="/" className={buttonClasses('primary')}>
                Back to the blog
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return <>{children ?? <Outlet />}</>;
}
