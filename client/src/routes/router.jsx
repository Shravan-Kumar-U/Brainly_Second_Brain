import { createBrowserRouter } from 'react-router';

import AppShell from '@/components/layout/AppShell';
import AuthLayout from '@/components/layout/AuthLayout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import RegisterPage from '@/pages/RegisterPage';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AddItemPage from '@/pages/AddItemPage';
import LibraryPage from '@/pages/LibraryPage';
import InsightsPage from '@/pages/InsightsPage';
import SettingsPage from '@/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    // Logged-out area
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    // Logged-in area. Phase 6 adds more screens inside AppShell.
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/library', element: <LibraryPage /> },
          { path: '/insights', element: <InsightsPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/add', element: <AddItemPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);