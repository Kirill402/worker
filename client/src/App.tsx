import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './features/auth/hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const LoginPage = lazy(() =>
  import('./features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);

const DashboardPage = lazy(() =>
  import('./features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);

const AuthApp: React.FC = () => {
  const { user, isAuthenticated, login, register, logout, isLoading, error } = useAuth();

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={login}
        onRegisterSuccess={register}
        isLoading={isLoading}
        serverError={error?.message}
      />
    );
  }

  return <DashboardPage userName={user?.name || ''} onLogout={logout} />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500"></div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<AuthApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
};
