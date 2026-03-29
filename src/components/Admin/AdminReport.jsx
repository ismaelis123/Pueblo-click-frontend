import React, { useState, useEffect } from 'react';
import { FiDownload, FiDollarSign, FiPackage, FiUsers } from 'react-icons/fi';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await api.get('/admin/report');
      setReport(response.data);
    } catch (error) {
      toast.error('Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    const data = JSON.stringify(report, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-pueblo-click-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reporte descargado');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text">Reporte General</h1>
        <button onClick={handleDownloadReport} className="btn-secondary flex items-center gap-2">
          <FiDownload /> Descargar Reporte
        </button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <FiPackage className="text-3xl text-primary mx-auto mb-2" />
          <h3 className="text-2xl font-bold">{report?.totalOrders || 0}</h3>
          <p className="text-gray-500">Órdenes Completadas</p>
        </div>
        
        <div className="card text-center">
          <FiDollarSign className="text-3xl text-secondary mx-auto mb-2" />
          <h3 className="text-2xl font-bold">{formatCurrency(report?.totalEarnings || 0)}</h3>
          <p className="text-gray-500">Ganancias Totales</p>
        </div>
        
        <div className="card text-center">
          <FiDollarSign className="text-3xl text-primary mx-auto mb-2" />
          <h3 className="text-2xl font-bold">{formatCurrency(report?.totalDeposits || 0)}</h3>
          <p className="text-gray-500">Depósitos Recibidos</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FiUsers /> Usuarios
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Mandaditos registrados:</span>
              <span className="font-semibold">{report?.totalMandaditos || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Clientes registrados:</span>
              <span className="font-semibold">{report?.totalClients || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total usuarios:</span>
              <span className="font-semibold">{(report?.totalMandaditos || 0) + (report?.totalClients || 0)}</span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FiDollarSign /> Finanzas
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Ganancia por orden:</span>
              <span className="font-semibold text-primary">C$ 5.00</span>
            </div>
            <div className="flex justify-between">
              <span>Total depósitos confirmados:</span>
              <span className="font-semibold">{formatCurrency(report?.totalDeposits || 0)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span>Saldo total:</span>
              <span className="font-bold text-secondary">{formatCurrency((report?.totalEarnings || 0) + (report?.totalDeposits || 0))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReport;