import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";

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

const RouteLoadingFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center px-4 py-16">
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-primary/40 border-t-primary"
        aria-hidden="true"
      />
      <span>Loading your page...</span>
    </div>
  </div>
);

import Navbar from './components/Navbar';

// Layout wrapper that adds footer to every page
const Layout = ({ children }) => {
  const location = useLocation();
  // Don't show footer on pure auth pages
  const noFooterRoutes = ['/login', '/register'];
  const showFooter = !noFooterRoutes.includes(location.pathname);

  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem("user"));

  React.useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("user"));
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant={isAuthenticated ? "auth" : "public"} />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {showFooter && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<RouteLoadingFallback />}>
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
