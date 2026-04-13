import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Background from './components/Layout/Background';
import InstallButton from './components/Common/InstallButton';
import NotificationBanner from './components/Common/NotificationBanner';
import PermissionManager from './components/Common/PermissionManager';

// Auth
import Login from './components/Auth/Login';
import RegisterClient from './components/Auth/RegisterClient';
import RegisterMandadito from './components/Auth/RegisterMandadito';

// Cliente
import CreateOrder from './components/Client/CreateOrder';
import ClientOrders from './components/Client/ClientOrders';
import RateMandadito from './components/Client/RateMandadito';
import MandaditosList from './components/Client/MandaditosList';
import MandaditoProfile from './components/Client/MandaditoProfile';
import ClientChat from './components/Client/Chat';
import OrderTracking from './components/Client/OrderTracking';

// Mandadito
import MandaditoDashboard from './components/Mandadito/MandaditoDashboard';
import PendingOrders from './components/Mandadito/PendingOrders';
import MyOrders from './components/Mandadito/MyOrders';
import EarningsReport from './components/Mandadito/EarningsReport';
import RechargeCredit from './components/Mandadito/RechargeCredit';
import MandaditoChat from './components/Mandadito/Chat';
import ShareLocation from './components/Mandadito/ShareLocation';
import WorkSchedule from './components/Mandadito/WorkSchedule';

// Admin
import AdminDashboard from './components/Admin/AdminDashboard';
import PendingDeposits from './components/Admin/PendingDeposits';
import AdminReport from './components/Admin/AdminReport';
import UsersList from './components/Admin/UsersList';
import PendingVerification from './components/Admin/PendingVerification';

// Common
import Profile from './components/Common/Profile';

function App() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      if (user.role === 'mandadito' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(() => {}, () => {}, { enableHighAccuracy: true, timeout: 5000 });
      }
    }
  }, [isAuthenticated, user]);

  return (
    <Background>
      {isAuthenticated && <Navbar />}
      <main className="flex-1 pb-20 md:pb-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register/client" element={<RegisterClient />} />
          <Route path="/register/mandadito" element={<RegisterMandadito />} />
          
          <Route path="/" element={
            isAuthenticated ? (
              user?.role === 'client' ? <Navigate to="/client/orders" replace /> :
              user?.role === 'mandadito' ? <Navigate to="/mandadito/dashboard" replace /> :
              user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
              <Navigate to="/login" replace />
            ) : <Navigate to="/login" replace />
          } />

          {/* Cliente */}
          <Route path="/client/orders" element={<ProtectedRoute roles={['client']}><ClientOrders /></ProtectedRoute>} />
          <Route path="/client/create-order" element={<ProtectedRoute roles={['client']}><CreateOrder /></ProtectedRoute>} />
          <Route path="/client/rate" element={<ProtectedRoute roles={['client']}><RateMandadito /></ProtectedRoute>} />
          <Route path="/client/mandaditos" element={<ProtectedRoute roles={['client']}><MandaditosList /></ProtectedRoute>} />
          <Route path="/client/mandadito/:id" element={<ProtectedRoute roles={['client']}><MandaditoProfile /></ProtectedRoute>} />
          <Route path="/client/chat/:orderId" element={<ProtectedRoute roles={['client']}><ClientChat /></ProtectedRoute>} />
          <Route path="/client/track/:orderId" element={<ProtectedRoute roles={['client']}><OrderTracking /></ProtectedRoute>} />

          {/* Mandadito */}
          <Route path="/mandadito/dashboard" element={<ProtectedRoute roles={['mandadito']}><MandaditoDashboard /></ProtectedRoute>} />
          <Route path="/mandadito/pending" element={<ProtectedRoute roles={['mandadito']}><PendingOrders /></ProtectedRoute>} />
          <Route path="/mandadito/orders" element={<ProtectedRoute roles={['mandadito']}><MyOrders /></ProtectedRoute>} />
          <Route path="/mandadito/earnings" element={<ProtectedRoute roles={['mandadito']}><EarningsReport /></ProtectedRoute>} />
          <Route path="/mandadito/recharge" element={<ProtectedRoute roles={['mandadito']}><RechargeCredit /></ProtectedRoute>} />
          <Route path="/mandadito/chat/:orderId" element={<ProtectedRoute roles={['mandadito']}><MandaditoChat /></ProtectedRoute>} />
          <Route path="/mandadito/share-location/:orderId" element={<ProtectedRoute roles={['mandadito']}><ShareLocation /></ProtectedRoute>} />
          <Route path="/mandadito/schedule" element={<ProtectedRoute roles={['mandadito']}><WorkSchedule /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/deposits" element={<ProtectedRoute roles={['admin']}><PendingDeposits /></ProtectedRoute>} />
          <Route path="/admin/report" element={<ProtectedRoute roles={['admin']}><AdminReport /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UsersList /></ProtectedRoute>} />
          <Route path="/admin/verify" element={<ProtectedRoute roles={['admin']}><PendingVerification /></ProtectedRoute>} />

          {/* Perfil */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {isAuthenticated && <Footer />}
      <InstallButton />
      <NotificationBanner />
      <PermissionManager />
    </Background>
  );
}

export default App;