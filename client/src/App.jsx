import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';

import { AuthProvider } from '@/context/AuthProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import { ToastProvider } from '@/context/ToastProvider';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes/router';
import { PwaUpdatePrompt } from '@/components/pwa/PwaUpdatePrompt';

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
             <PwaUpdatePrompt />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}