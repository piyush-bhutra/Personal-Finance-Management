import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AboutPage from './pages/About';
import SupportPage from './pages/Support';
import HomePage from './pages/Home';
import ExpensesPage from './pages/Expenses';
import InvestmentsPage from './pages/Investments';
import FeaturesPage from './pages/Features';
import TransactionsPage from './pages/TransactionsPage';
import Footer from './components/Footer';

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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
