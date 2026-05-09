import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ScrollToTop from './components/ScrollToTop';

// Public Layout & Pages
import PublicLayout from './layouts/PublicLayout';
import LandingPage from './pages/public/LandingPage';
import ExplorePage from './pages/public/ExplorePage';
import PropertyDetails from './pages/public/PropertyDetails';

// Shared Layout & Pages
import MessagesPage from './pages/shared/MessagesPage';
import ManageStays from './pages/owner/ManageStays';

// Owner Layout & Pages
import OwnerLayout from './layouts/OwnerLayout';
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Broker Layout & Pages
import BrokerLayout from './layouts/BrokerLayout';
import BrokerDashboard from './pages/broker/BrokerDashboard';

// Protected Route Wrapper for generic access (like /profile)
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

import { SocketProvider } from './contexts/SocketContext';

// ─── Animated Routes wrapper ─────────────────────────────
const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} {...pageTransition} className="flex-1 flex flex-col w-full">
        <Routes location={location}>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Public Routes - Wrapped in PublicLayout */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="stays/:id" element={<PropertyDetails />} />
            
            {/* Protected generic routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<div className="p-8">Profile Coming Soon...</div>} />
              <Route path="messages" element={<MessagesPage />} />
            </Route>
          </Route>

          {/* Owner Admin Routes */}
          <Route path="/owner" element={<OwnerLayout />}>
            <Route index element={<OwnerDashboard />} />
            <Route path="properties" element={<ManageStays />} />
            <Route path="team" element={<div className="p-8">Team Feature Coming Soon...</div>} />
            <Route path="inbox" element={<MessagesPage />} />
          </Route>

          {/* Broker Routes */}
          <Route path="/broker" element={<BrokerLayout />}>
            <Route index element={<BrokerDashboard />} />
            <Route path="properties" element={<ManageStays />} />
            <Route path="inbox" element={<MessagesPage />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AnimatedRoutes />
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
