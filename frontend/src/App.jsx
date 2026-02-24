import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/Login'));
const RegisterPage = lazy(() => import('./pages/Register'));
const AboutPage = lazy(() => import('./pages/About'));
const SupportPage = lazy(() => import('./pages/Support'));
const HomePage = lazy(() => import('./pages/Home'));
const ExpensesPage = lazy(() => import('./pages/Expenses'));
const InvestmentsPage = lazy(() => import('./pages/Investments'));
const FeaturesPage = lazy(() => import('./pages/Features'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const ReportsPage = lazy(() => import('./pages/Reports'));
const AnalyticsPage = lazy(() => import('./pages/Analytics'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Layout wrapper that adds footer to every page
const Layout = ({ children }) => {
  const location = useLocation();
  // Don't show footer on pure auth pages
  const noFooterRoutes = ['/login', '/register'];
  const showFooter = !noFooterRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
            <Route path="/investments" element={<ProtectedRoute><InvestmentsPage /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;
