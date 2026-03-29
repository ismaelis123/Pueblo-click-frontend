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
      const response = await api.get('/mandadito/orders/pending');
      setOrders(response.data);
    } catch (error) {
      toast.error('Error al cargar órdenes pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (order) => {
    setAcceptingId(order._id);
    try {
      let response;

      // 🔑 LÓGICA CORREGIDA: elegir el endpoint correcto
      if (order.status === 'pending_confirmation') {
        // Orden asignada directamente por cliente
        response = await api.put(`/mandadito/orders/${order._id}/accept-direct`);
      } else {
        // Orden pública (pending)
        response = await api.put(`/mandadito/orders/${order._id}/accept`);
      }

      toast.success(response.data.message || '✅ Mandado aceptado correctamente');
      fetchPendingOrders(); // recargar lista
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al aceptar el mandado');
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
      <h1 className="text-2xl font-bold text-text mb-6">📦 Órdenes Pendientes</h1>

      {orders.length === 0 ? (
        <div className="card text-center py-12">
          <FiMapPin className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay órdenes pendientes en este momento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {order.client?.profilePhoto ? (
                      <img
                        src={order.client.profilePhoto}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-text">{order.client?.name}</p>
                    <button
                      onClick={() => handleCallClient(order.client?.phone)}
                      className="flex items-center gap-1 text-xs text-secondary hover:text-secondary/80"
                    >
                      <FiPhone className="text-xs" />
                      <span>{order.client?.phone}</span>
                    </button>
                  </div>
                </div>

                <span className={`badge ${order.status === 'pending_confirmation' ? 'badge-accepted' : 'badge-pending'}`}>
                  {order.status === 'pending_confirmation' ? 'Asignado directo' : 'Pendiente'}
                </span>
              </div>

              <p className="text-gray-700 mb-3">{order.description}</p>

              <div className="space-y-1 text-sm text-gray-500 mb-4">
                <p>📍 Recoger en: {order.pickupAddress}</p>
                <p>🏠 Entregar en: {order.deliveryAddress}</p>
                <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div>
                  <span className="font-semibold text-primary">Ganancia: {formatCurrency(order.amount)}</span>
                  <p className="text-xs text-gray-400">*Se descuenta al aceptar</p>
                </div>

                <button
                  onClick={() => handleAcceptOrder(order)}
                  disabled={acceptingId === order._id}
                  className="btn-primary text-sm py-2 px-6 flex items-center gap-2"
                >
                  {acceptingId === order._id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiCheck />
                  )}
                  Aceptar Mandado
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