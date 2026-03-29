import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

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

// Mandadito
import MandaditoDashboard from './components/Mandadito/MandaditoDashboard';
import PendingOrders from './components/Mandadito/PendingOrders';
import MyOrders from './components/Mandadito/MyOrders';
import EarningsReport from './components/Mandadito/EarningsReport';
import RechargeCredit from './components/Mandadito/RechargeCredit';

// Admin
import AdminDashboard from './components/Admin/AdminDashboard';
import PendingDeposits from './components/Admin/PendingDeposits';
import AdminReport from './components/Admin/AdminReport';
import UsersList from './components/Admin/UsersList';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-light to-white flex flex-col">
      {/* Navbar solo si está autenticado */}
      {isAuthenticated && <Navbar />}

      <main className="flex-1 pb-20 md:pb-8">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register/client" element={<RegisterClient />} />
          <Route path="/register/mandadito" element={<RegisterMandadito />} />

          {/* Redirección raíz según rol */}
          <Route path="/" element={
            isAuthenticated ? (
              user?.role === 'client' ? <Navigate to="/client/orders" replace /> :
              user?.role === 'mandadito' ? <Navigate to="/mandadito/dashboard" replace /> :
              user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
              <Navigate to="/login" replace />
            ) : <Navigate to="/login" replace />
          } />

          {/* ==================== RUTAS CLIENTE ==================== */}
          <Route path="/client/orders" element={
            <ProtectedRoute roles={['client']}>
              <ClientOrders />
            </ProtectedRoute>
          } />

          <Route path="/client/create-order" element={
            <ProtectedRoute roles={['client']}>
              <CreateOrder />
            </ProtectedRoute>
          } />

          <Route path="/client/rate" element={
            <ProtectedRoute roles={['client']}>
              <RateMandadito />
            </ProtectedRoute>
          } />

          <Route path="/client/mandaditos" element={
            <ProtectedRoute roles={['client']}>
              <MandaditosList />
            </ProtectedRoute>
          } />

          <Route path="/client/mandadito/:id" element={
            <ProtectedRoute roles={['client']}>
              <MandaditoProfile />
            </ProtectedRoute>
          } />

          {/* ==================== RUTAS MANDADITO ==================== */}
          <Route path="/mandadito/dashboard" element={
            <ProtectedRoute roles={['mandadito']}>
              <MandaditoDashboard />
            </ProtectedRoute>
          } />

          <Route path="/mandadito/pending" element={
            <ProtectedRoute roles={['mandadito']}>
              <PendingOrders />
            </ProtectedRoute>
          } />

          <Route path="/mandadito/orders" element={
            <ProtectedRoute roles={['mandadito']}>
              <MyOrders />
            </ProtectedRoute>
          } />

          <Route path="/mandadito/earnings" element={
            <ProtectedRoute roles={['mandadito']}>
              <EarningsReport />
            </ProtectedRoute>
          } />

          <Route path="/mandadito/recharge" element={
            <ProtectedRoute roles={['mandadito']}>
              <RechargeCredit />
            </ProtectedRoute>
          } />

          {/* ==================== RUTAS ADMIN ==================== */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/deposits" element={
            <ProtectedRoute roles={['admin']}>
              <PendingDeposits />
            </ProtectedRoute>
          } />

          <Route path="/admin/report" element={
            <ProtectedRoute roles={['admin']}>
              <AdminReport />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <UsersList />
            </ProtectedRoute>
          } />

          {/* Perfil temporal */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* 404 - Redirige a la página principal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer solo si está autenticado */}
      {isAuthenticated && <Footer />}
    </div>
  );
}

// Componente Profile temporal
const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="card text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center overflow-hidden">
          {user?.profilePhoto ? (
            <img 
              src={user.profilePhoto} 
              alt={user.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span className="text-4xl text-primary font-bold">
              {user?.name?.charAt(0) || '?'}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-dark">{user?.name}</h2>
        <p className="text-gray-500">{user?.phone}</p>
        
        <p className="text-sm text-gray-400 mt-2">
          Rol: {user?.role === 'client' ? 'Cliente' : 
                user?.role === 'mandadito' ? 'Mandadito' : 'Administrador'}
        </p>

        {user?.role === 'mandadito' && (
          <p className="text-primary font-bold mt-3">
            Crédito disponible: C${user?.credit || 0}
          </p>
        )}

        {user?.rating > 0 && (
          <div className="flex justify-center gap-1 mt-4">
            {[...Array(5)].map((_, i) => (
              <FiStar 
                key={i} 
                className={i < Math.round(user.rating) ? 'text-accent fill-accent' : 'text-gray-300'} 
              />
            ))}
            <span className="text-sm text-gray-500 ml-2">
              ({user.totalRatings || 0})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;