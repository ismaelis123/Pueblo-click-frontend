import React, { useState, useEffect } from 'react';
import { FiCheck, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const PendingDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const response = await api.get('/admin/deposits/pending');
      setDeposits(response.data);
    } catch (error) {
      toast.error('Error al cargar depósitos');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (depositId) => {
    setConfirmingId(depositId);
    try {
      await api.put(`/admin/deposits/${depositId}/confirm`);
      toast.success('Depósito confirmado. Crédito agregado.');
      fetchDeposits();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al confirmar depósito');
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-text mb-6">Depósitos Pendientes</h1>
      
      {deposits.length === 0 ? (
        <div className="card text-center py-12">
          <FiClock className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay depósitos pendientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deposits.map((deposit) => (
            <div key={deposit._id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-text">{deposit.mandadito?.name}</h3>
                  <p className="text-sm text-gray-500">{deposit.mandadito?.phone}</p>
                </div>
                <span className="badge badge-pending">Pendiente</span>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <p><strong>Monto:</strong> {formatCurrency(deposit.amount)}</p>
                <p><strong>Referencia:</strong> {deposit.reference}</p>
                <p><strong>Fecha:</strong> {formatDate(deposit.createdAt)}</p>
              </div>
              
              <button
                onClick={() => handleConfirm(deposit._id)}
                disabled={confirmingId === deposit._id}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {confirmingId === deposit._id ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiCheck />
                    Confirmar Depósito
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingDeposits;