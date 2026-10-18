import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Public pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Protected pages
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import MedicinesPage from './pages/medicines/MedicinesPage';
import MedicineDetailPage from './pages/medicines/MedicineDetailPage';
import AddMedicinePage from './pages/medicines/AddMedicinePage';
import PrescriptionScanPage from './pages/scanning/PrescriptionScanPage';
import PackageScanPage from './pages/scanning/PackageScanPage';
import FamilyHubPage from './pages/family/FamilyHubPage';
import CarePlansPage from './pages/care-plans/CarePlansPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected routes */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="medicines" element={<MedicinesPage />} />
                <Route path="medicines/add" element={<AddMedicinePage />} />
                <Route path="medicines/:id" element={<MedicineDetailPage />} />
                <Route path="scan/prescription" element={<PrescriptionScanPage />} />
                <Route path="scan/package" element={<PackageScanPage />} />
                <Route path="family" element={<FamilyHubPage />} />
                <Route path="care-plans" element={<CarePlansPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
