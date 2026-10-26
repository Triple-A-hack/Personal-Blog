import { ArrowLeft, FolderTree, LogOut, PenSquare, Settings, Tags, FileText, type LucideIcon } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/admin/posts',
    label: 'Posts',
    icon: FileText,
    isActive: (p) => p.startsWith('/admin/posts') && p !== '/admin/posts/new',
  },
  { to: '/admin/posts/new', label: 'Create Post', icon: PenSquare, isActive: (p) => p === '/admin/posts/new' },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree, isActive: (p) => p === '/admin/categories' },
  { to: '/admin/tags', label: 'Tags', icon: Tags, isActive: (p) => p === '/admin/tags' },
  { to: '/admin/settings', label: 'Settings', icon: Settings, isActive: (p) => p === '/admin/settings' },
];

export function AdminLayout() {
  const { user, role, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between px-4 py-3 lg:block lg:px-5 lg:py-5">
          <Link to="/admin/posts" className="text-lg font-bold tracking-tight">
            Inkwell <span className="text-indigo-600">Admin</span>
          </Link>
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
          {NAV_ITEMS.map(({ to, label, icon: Icon, isActive }) => {
            const active = isActive(pathname);
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden space-y-3 border-t border-gray-200 p-4 lg:absolute lg:bottom-0 lg:block lg:w-64 dark:border-gray-800">
          {user && (
            <div className="flex items-center gap-3">
              <Avatar name={user.name} src={user.avatarUrl} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                {role && <Badge tone="indigo">{role}</Badge>}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              View site
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
