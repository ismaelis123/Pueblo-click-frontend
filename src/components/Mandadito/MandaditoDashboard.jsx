import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPackage, FiDollarSign, FiToggleLeft, FiToggleRight, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

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
      toast.success(response.data.isAvailable ? 'Ahora estás disponible' : 'Te has desconectado');
    } catch (error) {
      toast.error('Error al cambiar disponibilidad');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 pb-20 md:pb-8">
      {/* Perfil del mandadito */}
      <div className="card mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <FiUser className="text-3xl text-primary" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-text">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.phone}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-secondary">⭐ {user?.rating?.toFixed(1) || 0}</span>
            <span className="text-xs text-gray-400">({user?.totalRatings || 0} calificaciones)</span>
          </div>
        </div>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card text-center">
          <FiPackage className="text-3xl text-primary mx-auto mb-2" />
          <h3 className="text-2xl font-bold">{stats.pendingOrders}</h3>
          <p className="text-gray-500 text-sm">Órdenes Pendientes</p>
        </div>
        
        <div className="card text-center">
          <FiDollarSign className="text-3xl text-secondary mx-auto mb-2" />
          <h3 className="text-2xl font-bold">{formatCurrency(stats.todayEarnings)}</h3>
          <p className="text-gray-500 text-sm">Ganancias Totales</p>
        </div>
      </div>
      
      {/* Crédito y disponibilidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card bg-gradient-to-r from-primary/10 to-primary/5">
          <h3 className="text-sm text-gray-500">Crédito Disponible</h3>
          <p className="text-3xl font-bold text-primary">{formatCurrency(user?.credit || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Cada mandado cuesta C$5</p>
        </div>
        
        <div className="card flex justify-between items-center">
          <div>
            <h3 className="text-sm text-gray-500">Estado</h3>
            <p className="font-semibold">{isAvailable ? 'Disponible' : 'No disponible'}</p>
            <p className="text-xs text-gray-400">
              {isAvailable ? 'Recibirás notificaciones' : 'No recibirás nuevas órdenes'}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              isAvailable 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isAvailable ? <FiToggleRight className="text-xl" /> : <FiToggleLeft className="text-xl" />}
            {isAvailable ? 'Disponible' : 'No disponible'}
          </button>
        </div>
      </div>
      
      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <a href="/mandadito/pending" className="btn-primary text-center">
          Ver órdenes pendientes
        </a>
        <a href="/mandadito/orders" className="btn-secondary text-center">
          Mis órdenes
        </a>
        <a href="/mandadito/earnings" className="btn-outline text-center">
          Reporte de ganancias
        </a>
        <a href="/mandadito/recharge" className="btn-outline text-center">
          Recargar crédito
        </a>
      </div>
    </div>
  );
};

export default MandaditoDashboard;