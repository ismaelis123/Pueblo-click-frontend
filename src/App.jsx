import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Background from './components/Layout/Background';

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
import Chat from './components/Client/Chat';

// Mandadito
import MandaditoDashboard from './components/Mandadito/MandaditoDashboard';
import PendingOrders from './components/Mandadito/PendingOrders';
import MyOrders from './components/Mandadito/MyOrders';
import EarningsReport from './components/Mandadito/EarningsReport';
import RechargeCredit from './components/Mandadito/RechargeCredit';
import MandaditoChat from './components/Mandadito/Chat';

// Admin
import AdminDashboard from './components/Admin/AdminDashboard';
import PendingDeposits from './components/Admin/PendingDeposits';
import AdminReport from './components/Admin/AdminReport';
import UsersList from './components/Admin/UsersList';
import PendingVerification from './components/Admin/PendingVerification';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Background>
      {isAuthenticated && <Navbar />}
      
      <main className="flex-1 pb-20 md:pb-8">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register/client" element={<RegisterClient />} />
          <Route path="/register/mandadito" element={<RegisterMandadito />} />

          {/* Redirección raíz */}
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
          <Route path="/client/chat/:orderId" element={<ProtectedRoute roles={['client']}><Chat /></ProtectedRoute>} />

          {/* Mandadito */}
          <Route path="/mandadito/dashboard" element={<ProtectedRoute roles={['mandadito']}><MandaditoDashboard /></ProtectedRoute>} />
          <Route path="/mandadito/pending" element={<ProtectedRoute roles={['mandadito']}><PendingOrders /></ProtectedRoute>} />
          <Route path="/mandadito/orders" element={<ProtectedRoute roles={['mandadito']}><MyOrders /></ProtectedRoute>} />
          <Route path="/mandadito/earnings" element={<ProtectedRoute roles={['mandadito']}><EarningsReport /></ProtectedRoute>} />
          <Route path="/mandadito/recharge" element={<ProtectedRoute roles={['mandadito']}><RechargeCredit /></ProtectedRoute>} />
          <Route path="/mandadito/chat/:orderId" element={<ProtectedRoute roles={['mandadito']}><MandaditoChat /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/deposits" element={<ProtectedRoute roles={['admin']}><PendingDeposits /></ProtectedRoute>} />
          <Route path="/admin/report" element={<ProtectedRoute roles={['admin']}><AdminReport /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UsersList /></ProtectedRoute>} />
          <Route path="/admin/verify" element={<ProtectedRoute roles={['admin']}><PendingVerification /></ProtectedRoute>} />

          {/* Perfil */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {isAuthenticated && <Footer />}
    </Background>
  );
}

// Componente Profile temporal
const Profile = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E63946]/20 to-[#1E3A8A]/20 mx-auto mb-4 flex items-center justify-center overflow-hidden">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-[#E63946]">{user?.name?.charAt(0) || '?'}</span>
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
        <p className="text-gray-500">{user?.phone}</p>
        <p className="text-sm text-gray-400 mt-2">
          Rol: {user?.role === 'client' ? 'Cliente' : user?.role === 'mandadito' ? 'Mandadito' : 'Administrador'}
        </p>
        {user?.role === 'mandadito' && (
          <p className="text-[#E63946] font-bold mt-3">Crédito: C${user?.credit || 0}</p>
        )}
        {user?.rating > 0 && (
          <div className="flex justify-center gap-1 mt-4">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className={i < Math.round(user.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
            ))}
            <span className="text-sm text-gray-500 ml-2">({user.totalRatings || 0})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;