import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiPackage, FiCalendar } from 'react-icons/fi';
import api from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const EarningsReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await api.get('/mandadito/earnings');
      setReport(response.data);
    } catch (error) {
      toast.error('Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-text mb-6">Reporte de Ganancias</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card text-center">
          <FiPackage className="text-4xl text-primary mx-auto mb-2" />
          <h3 className="text-3xl font-bold">{report?.totalOrders || 0}</h3>
          <p className="text-gray-500">Total de Mandados Completados</p>
        </div>
        
        <div className="card text-center">
          <FiDollarSign className="text-4xl text-secondary mx-auto mb-2" />
          <h3 className="text-3xl font-bold">{formatCurrency(report?.totalEarnings || 0)}</h3>
          <p className="text-gray-500">Ganancias Totales</p>
        </div>
      </div>
      
      {report?.orders?.length > 0 ? (
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FiCalendar /> Historial de Mandados
          </h3>
          <div className="space-y-3">
            {report.orders.map((order) => (
              <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-700">{order.description?.substring(0, 50)}...</p>
                  <p className="text-xs text-gray-400">{formatDate(order.completedAt)}</p>
                </div>
                <span className="font-semibold text-primary">{formatCurrency(5)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-500">Aún no has completado mandados</p>
          <a href="/mandadito/pending" className="btn-primary mt-4 inline-block">
            Ver órdenes pendientes
          </a>
        </div>
      )}
    </div>
  );
};

export default EarningsReport;