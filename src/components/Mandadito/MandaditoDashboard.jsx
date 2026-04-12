import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPackage, FiDollarSign, FiToggleLeft, FiToggleRight, FiUser, FiClock, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

const MandaditoDashboard = () => {
  const { user, login } = useAuth();
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || true);
  const [stats, setStats] = useState({ pendingOrders: 0, todayEarnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [pendingRes, earningsRes] = await Promise.all([
        api.get('/mandadito/orders/pending'),
        api.get('/mandadito/earnings')
      ]);
      setStats({
        pendingOrders: pendingRes.data.length,
        todayEarnings: earningsRes.data.totalEarnings || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const response = await api.put('/mandadito/availability');
      setIsAvailable(response.data.isAvailable);
      toast.success(response.data.isAvailable ? '✅ Ahora estás disponible para recibir mandados' : '🔴 Te has desconectado. No recibirás nuevos mandados');
    } catch (error) {
      toast.error('Error al cambiar disponibilidad');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Background>
      <div className="container mx-auto py-6 px-4 pb-24 md:pb-8">
        {/* Perfil del mandadito */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B35]/20 to-[#4361EE]/20 flex items-center justify-center overflow-hidden">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <FiUser className="text-3xl text-[#FF6B35]" />
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.phone}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
              <div className="flex items-center gap-1">
                <span className="text-sm text-yellow-500">⭐ {user?.rating?.toFixed(1) || 0}</span>
                <span className="text-xs text-gray-400">({user?.totalRatings || 0} calificaciones)</span>
              </div>
              {user?.isVerified && (
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <FiCheckCircle className="text-xs" /> Verificado
                </div>
              )}
              {user?.workSchedule?.enabled && (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  <FiClock className="text-xs" /> {user.workSchedule.startTime} - {user.workSchedule.endTime}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className={`text-sm font-semibold px-4 py-1 rounded-full ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isAvailable ? '🟢 Disponible' : '🔴 No disponible'}
            </div>
            <button
              onClick={handleToggleAvailability}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isAvailable 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              {isAvailable ? <FiToggleRight className="text-xl" /> : <FiToggleLeft className="text-xl" />}
              {isAvailable ? 'Desactivar disponibilidad' : 'Activar disponibilidad'}
            </button>
          </div>
        </div>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
            <FiPackage className="text-3xl text-[#FF6B35] mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{stats.pendingOrders}</h3>
            <p className="text-gray-500 text-sm">Órdenes Pendientes</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
            <FiDollarSign className="text-3xl text-[#4361EE] mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{formatCurrency(stats.todayEarnings)}</h3>
            <p className="text-gray-500 text-sm">Ganancias Totales</p>
          </div>
        </div>
        
        {/* Crédito */}
        <div className="bg-gradient-to-r from-[#FF6B35]/10 to-[#4361EE]/10 rounded-2xl p-5 mb-6 text-center">
          <h3 className="text-sm text-gray-500">Crédito Disponible</h3>
          <p className="text-3xl font-bold text-[#FF6B35]">{formatCurrency(user?.credit || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Cada mandado cuesta C$5</p>
        </div>
        
        {/* Acciones rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <a href="/mandadito/pending" className="btn-primary text-center py-3">📦 Ver órdenes pendientes</a>
          <a href="/mandadito/orders" className="btn-secondary text-center py-3">📋 Mis órdenes</a>
          <a href="/mandadito/earnings" className="btn-outline text-center py-3">💰 Reporte de ganancias</a>
          <a href="/mandadito/recharge" className="btn-outline text-center py-3">💳 Recargar crédito</a>
          <a href="/mandadito/schedule" className="btn-outline text-center py-3 col-span-2">⏰ Configurar horario</a>
        </div>
      </div>
    </Background>
  );
};

export default MandaditoDashboard;