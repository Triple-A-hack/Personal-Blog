import { LayoutDashboard, LogIn, LogOut, Menu, PenLine, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { buttonClasses } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/queries';
import { cn } from '@/utils/cn';
import { SearchBox } from './SearchBox';

const MAX_INLINE_CATEGORIES = 5;

export function Navbar() {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const { data: categories = [] } = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const activeCategory = location.pathname === '/' ? searchParams.get('category') : null;
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const linkClass = (active: boolean) =>
    cn(
      'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
      active
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
    );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight" onClick={closeMenu}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <PenLine className="h-4 w-4" aria-hidden="true" />
          </span>
          Inkwell
        </Link>

        <nav aria-label="Categories" className="ml-2 hidden items-center gap-1 lg:flex">
          {categories.slice(0, MAX_INLINE_CATEGORIES).map((category) => (
            <Link
              key={category.id}
              to={`/?category=${encodeURIComponent(category.slug)}`}
              className={linkClass(activeCategory === category.slug)}
              aria-current={activeCategory === category.slug ? 'page' : undefined}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-xs md:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle />

          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated && user ? (
              <>
                {isStaff && (
                  <Link to="/admin" className={buttonClasses('secondary', 'sm')}>
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    Dashboard
                  </Link>
                )}
                <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className={buttonClasses('primary', 'sm')}>
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign in
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden dark:text-gray-300 dark:hover:bg-gray-800"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-gray-200 px-4 py-4 md:hidden dark:border-gray-800">
          <SearchBox />
          <nav aria-label="Categories" className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/?category=${encodeURIComponent(category.slug)}`}
                onClick={closeMenu}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm',
                  activeCategory === category.slug
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300 dark:border-gray-700',
                )}
              >
                {category.name}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                  <span className="font-medium">{user.name}</span>
                </div>
                {isStaff && (
                  <Link to="/admin" onClick={closeMenu} className={buttonClasses('secondary')}>
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    Dashboard
                  </Link>
                )}
                <button type="button" onClick={handleLogout} className={buttonClasses('ghost')}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu} className={buttonClasses('primary')}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
