import { Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { apiClient } from '@/services/apiClient';
import { formatDate } from '@/utils/format';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AdminSettingsPage() {
  const { user, role } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    document.title = 'Settings — Inkwell Admin';
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {user && (
        <Card title="Profile">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} src={user.avatarUrl} size="lg" />
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
            {role && <Badge tone="indigo" className="ml-auto">{role}</Badge>}
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Member since {formatDate(user.createdAt)}</p>
        </Card>
      )}

      <Card title="Appearance">
        <div className="flex flex-wrap gap-3" role="group" aria-label="Theme">
          <Button variant={theme === 'light' ? 'primary' : 'secondary'} onClick={() => setTheme('light')} aria-pressed={theme === 'light'}>
            <Sun className="h-4 w-4" aria-hidden="true" />
            Light
          </Button>
          <Button variant={theme === 'dark' ? 'primary' : 'secondary'} onClick={() => setTheme('dark')} aria-pressed={theme === 'dark'}>
            <Moon className="h-4 w-4" aria-hidden="true" />
            Dark
          </Button>
        </div>
      </Card>

      <Card title="API connection">
        <p className="text-sm text-gray-600 dark:text-gray-400">Requests are sent to:</p>
        <code className="mt-2 block break-all rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">{apiClient.defaults.baseURL}</code>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Change it with the <code>VITE_API_URL</code> environment variable and restart the dev server.
        </p>
      </Card>
    </div>
  );
}
