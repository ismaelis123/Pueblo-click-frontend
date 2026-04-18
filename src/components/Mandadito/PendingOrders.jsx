import React, { useState, useEffect } from 'react';
import { FiMapPin, FiCheck, FiPhone, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mandadito/orders/pending');
      setOrders(response.data);
    } catch (error) {
      toast.error('Error al cargar órdenes pendientes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (order) => {
    setAcceptingId(order._id);
    try {
      let response;
      if (order.status === 'pending_confirmation') {
        response = await api.put(`/mandadito/orders/${order._id}/accept-direct`);
      } else {
        response = await api.put(`/mandadito/orders/${order._id}/accept`);
      }
      toast.success(response.data.message || '✅ Mandado aceptado');
      fetchPendingOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al aceptar');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleCallClient = (phone) => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-20 md:pb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📦 Órdenes Pendientes</h1>
        <button onClick={fetchPendingOrders} className="text-sm text-[#FF6B35] hover:underline">
          🔄 Actualizar
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <FiMapPin className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay órdenes pendientes en este momento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                    {order.client?.profilePhoto ? (
                      <img src={order.client.profilePhoto} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <FiUser className="text-[#FF6B35]" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{order.client?.name || 'Cliente'}</p>
                    {order.client?.phone && (
                      <button onClick={() => handleCallClient(order.client.phone)} className="flex items-center gap-1 text-xs text-[#FF6B35] hover:underline">
                        <FiPhone className="text-xs" /> {order.client.phone}
                      </button>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === 'pending_confirmation' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status === 'pending_confirmation' ? 'Asignado a ti' : 'Público'}
                </span>
              </div>

              <p className="text-gray-700 mb-3">{order.description}</p>

              <div className="space-y-1 text-sm text-gray-500 mb-4">
                <p>📍 Recoger: {order.pickupAddress}</p>
                <p>🏠 Entregar: {order.deliveryAddress}</p>
                <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div>
                  <span className="font-semibold text-[#FF6B35]">Ganancia: {formatCurrency(order.amount || 5)}</span>
                  <p className="text-xs text-gray-400">Se descuenta al aceptar</p>
                </div>
                <button
                  onClick={() => handleAcceptOrder(order)}
                  disabled={acceptingId === order._id}
                  className="bg-[#FF6B35] text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-[#e55a2b] disabled:opacity-50"
                >
                  {acceptingId === order._id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiCheck />
                  )}
                  Aceptar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingOrders;