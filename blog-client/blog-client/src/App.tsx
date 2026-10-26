import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Spinner } from '@/components/ui/Spinner';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PostDetailsPage } from '@/pages/PostDetailsPage';
import { RegisterPage } from '@/pages/RegisterPage';

// The dashboard (and Tiptap with it) is only downloaded when someone opens /admin.
const AdminPostsPage = lazy(() => import('@/pages/admin/AdminPostsPage').then((m) => ({ default: m.AdminPostsPage })));
const PostEditorPage = lazy(() => import('@/pages/admin/PostEditorPage').then((m) => ({ default: m.PostEditorPage })));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })));
const AdminTagsPage = lazy(() => import('@/pages/admin/AdminTagsPage').then((m) => ({ default: m.AdminTagsPage })));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));

export function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="posts/:slug" element={<PostDetailsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route path="admin" element={<ProtectedRoute allowedRoles={['ADMIN', 'AUTHOR']} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="posts" replace />} />
            <Route path="posts" element={<AdminPostsPage />} />
            <Route path="posts/new" element={<PostEditorPage />} />
            <Route path="posts/:slug/edit" element={<PostEditorPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="tags" element={<AdminTagsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
