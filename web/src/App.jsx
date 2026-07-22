// Credit Book — Main Application
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useSettingsStore from './store/settingsStore';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/home/HomePage';
import PersonDetailPage from './pages/persons/PersonDetailPage';
import SharedEntriesPage from './pages/shared/SharedEntriesPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SettingsPage from './pages/settings/SettingsPage';
import UserManualPage from './pages/settings/UserManualPage';
import SupportChatPage from './pages/settings/SupportChatPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPendingPage from './pages/admin/AdminPendingPage';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminPasswordResetPage from './pages/admin/AdminPasswordResetPage';
import SharePage from './pages/share/SharePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,              // Always treat data as stale — refetch on every mount
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnMount: true,       // Refetch whenever component mounts
    },
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { darkMode, applyTheme } = useSettingsStore();

  // Apply theme on mount
  useEffect(() => {
    applyTheme(darkMode);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Share page — fully public, no auth required */}
          <Route path="/share/:token" element={<SharePage />} />

          {/* Public routes */}
          <Route path="/login"          element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register"       element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected app routes */}
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<HomePage />} />
            <Route path="persons/:personId" element={<PersonDetailPage />} />
            <Route path="shared" element={<SharedEntriesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/manual" element={<UserManualPage />} />
            <Route path="settings/support" element={<SupportChatPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="users"          element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            <Route path="pending"        element={<AdminRoute><AdminPendingPage /></AdminRoute>} />
            <Route path="support"        element={<AdminRoute><AdminSupportPage /></AdminRoute>} />
            <Route path="analytics"      element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
            <Route path="password-reset" element={<AdminRoute><AdminPasswordResetPage /></AdminRoute>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--label-primary)',
            border: '0.5px solid var(--separator)',
            borderRadius: '12px',
            fontFamily: 'var(--font-text)',
            fontSize: '15px',
            fontWeight: '400',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(20px)',
          },
          success: {
            iconTheme: { primary: 'var(--color-green)', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: 'var(--color-red)', secondary: 'white' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
