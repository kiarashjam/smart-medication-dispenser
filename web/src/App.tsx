import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/app/components/ui/sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicLayout from '@/components/PublicLayout';
import AuthLayout from '@/components/AuthLayout';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Pricing from '@/pages/Pricing';
import FAQ from '@/pages/FAQ';
import Contact from '@/pages/Contact';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Security from '@/pages/Security';
import Careers from '@/pages/Careers';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Devices from '@/pages/Devices';
import DeviceDetail from '@/pages/DeviceDetail';
import Containers from '@/pages/Containers';
import Schedules from '@/pages/Schedules';
import History from '@/pages/History';
import Travel from '@/pages/Travel';
import Notifications from '@/pages/Notifications';
import Integrations from '@/pages/Integrations';
import Settings from '@/pages/Settings';
import CaregiverPeople from '@/pages/CaregiverPeople';
import { APP_BASE } from '@/lib/appRoutes';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PublicLayout>
                <About />
              </PublicLayout>
            }
          />
          <Route
            path="/pricing"
            element={
              <PublicLayout>
                <Pricing />
              </PublicLayout>
            }
          />
          <Route
            path="/faq"
            element={
              <PublicLayout>
                <FAQ />
              </PublicLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicLayout>
                <Contact />
              </PublicLayout>
            }
          />
          <Route
            path="/privacy"
            element={
              <PublicLayout>
                <Privacy />
              </PublicLayout>
            }
          />
          <Route
            path="/terms"
            element={
              <PublicLayout>
                <Terms />
              </PublicLayout>
            }
          />
          <Route
            path="/security"
            element={
              <PublicLayout>
                <Security />
              </PublicLayout>
            }
          />
          <Route
            path="/careers"
            element={
              <PublicLayout>
                <Careers />
              </PublicLayout>
            }
          />

          <Route
            path={APP_BASE}
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="people" element={<CaregiverPeople />} />
            <Route path="devices" element={<Devices />} />
            <Route path="devices/:deviceId" element={<DeviceDetail />} />
            <Route path="devices/:deviceId/containers" element={<Containers />} />
            <Route path="containers/:containerId/schedules" element={<Schedules />} />
            <Route path="schedules" element={<Navigate to={`${APP_BASE}/devices`} replace />} />
            <Route path="history" element={<History />} />
            <Route path="travel" element={<Travel />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}
