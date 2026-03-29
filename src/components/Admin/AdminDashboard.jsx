import React, { useState, useEffect } from 'react';
import { FiUsers, FiPackage, FiDollarSign, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/report');
      setStats(response.data);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const cards = [
    { icon: FiPackage, title: 'Órdenes Totales', value: stats?.totalOrders || 0, color: 'text-primary' },
    { icon: FiDollarSign, title: 'Ganancias Totales', value: formatCurrency(stats?.totalEarnings || 0), color: 'text-secondary' },
    { icon: FiUsers, title: 'Mandaditos', value: stats?.totalMandaditos || 0, color: 'text-primary' },
    { icon: FiUsers, title: 'Clientes', value: stats?.totalClients || 0, color: 'text-secondary' },
    { icon: FiClock, title: 'Depósitos Pendientes', value: stats?.pendingDeposits || 0, color: 'text-accent' },
    { icon: FiDollarSign, title: 'Depósitos Recibidos', value: formatCurrency(stats?.totalDeposits || 0), color: 'text-primary' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-text mb-6">Dashboard de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <card.icon className={`text-4xl ${card.color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Acciones rápidas</h3>
          <div className="space-y-2">
            <a href="/admin/deposits" className="btn-secondary block text-center">
              Ver depósitos pendientes
            </a>
            <a href="/admin/report" className="btn-outline block text-center">
              Ver reporte detallado
            </a>
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-semibold mb-3">Información del sistema</h3>
          <div className="space-y-2 text-gray-600">
            <p><strong>Total ganado:</strong> {formatCurrency(stats?.totalEarnings || 0)}</p>
            <p><strong>Total depósitos:</strong> {formatCurrency(stats?.totalDeposits || 0)}</p>
            <p><strong>Usuarios activos:</strong> {(stats?.totalMandaditos || 0) + (stats?.totalClients || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;