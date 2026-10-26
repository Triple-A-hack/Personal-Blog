import { PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/queries';

export function Footer() {
  const { data: categories = [] } = useCategories();

  return (
    <footer className="mt-16 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <PenLine className="h-4 w-4" aria-hidden="true" />
            </span>
            Inkwell
          </Link>
          <p className="mt-3 max-w-xs text-sm text-gray-600 dark:text-gray-400">
            Stories, tutorials and ideas worth reading, written by people who care about the craft.
          </p>
        </div>

        <nav aria-label="Footer categories">
          <h2 className="text-sm font-semibold">Categories</h2>
          {categories.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No categories yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link to={`/?category=${encodeURIComponent(category.slug)}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <nav aria-label="Footer links">
          <h2 className="text-sm font-semibold">Account</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Sign in
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Create an account
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-gray-200 py-5 text-center text-xs text-gray-500 dark:border-gray-800">
        © {new Date().getFullYear()} Inkwell. All rights reserved.
      </div>
    </footer>
  );
}
