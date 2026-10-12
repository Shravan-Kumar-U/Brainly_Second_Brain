import { createBrowserRouter } from 'react-router';

import AppShell from '@/components/layout/AppShell';
import AuthLayout from '@/components/layout/AuthLayout';
import AddItemPage from '@/pages/AddItemPage';
import CollectionDetailPage from '@/pages/CollectionDetailPage';
import CollectionsPage from '@/pages/CollectionsPage';
import FocusPage from '@/pages/FocusPage';
import HomePage from '@/pages/HomePage';
import InsightsPage from '@/pages/InsightsPage';
import LibraryPage from '@/pages/LibraryPage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import RegisterPage from '@/pages/RegisterPage';
import SettingsPage from '@/pages/SettingsPage';
import SharedCollectionPage from '@/pages/SharedCollectionPage';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

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
    // Logged-in area
    element: <ProtectedRoute />,
    children: [
      // Full-screen, no sidebar or bottom bar
      { path: '/focus/:id', element: <FocusPage /> },
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/library', element: <LibraryPage /> },
          { path: '/collections', element: <CollectionsPage /> },
          { path: '/collections/:id', element: <CollectionDetailPage /> },
          { path: '/insights', element: <InsightsPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/add', element: <AddItemPage /> },
        ],
      },
    ],
  },
  // Open to everyone, logged in or not. Deliberately NOT inside PublicRoute,
  // which would bounce logged-in visitors to Home.
  { path: '/s/:token', element: <SharedCollectionPage /> },
  { path: '*', element: <NotFoundPage /> },
]);