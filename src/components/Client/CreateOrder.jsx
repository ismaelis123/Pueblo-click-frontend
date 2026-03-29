import React, { useState, useEffect } from 'react';
import { FiPackage, FiCheck, FiStar, FiClock, FiPhone, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import { formatDate, getStatusText, getStatusColor, formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ClientOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/client/orders');
      setOrders(response.data);
    } catch (error) {
      toast.error('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceived = async (orderId) => {
    setConfirmingId(orderId);
    try {
      const response = await api.put(`/client/orders/${orderId}/confirm`);
      toast.success(response.data.message || '¡Gracias por confirmar!');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al confirmar');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCallMandadito = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleRateOrder = (orderId, mandaditoName) => {
    navigate('/client/rate', { state: { orderId, mandaditoName } });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-20 md:pb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Mis Órdenes</h1>
        <button
          onClick={() => navigate('/client/create-order')}
          className="btn-primary text-sm py-2 px-4"
        >
          + Nuevo Mandado
        </button>
      </div>
      
      {orders.length === 0 ? (
        <div className="card text-center py-12">
          <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes órdenes aún</p>
          <button
            onClick={() => navigate('/client/create-order')}
            className="btn-primary mt-4 inline-flex"
          >
            Crear mi primer mandado
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
                    {order.mandadito?.profilePhoto ? (
                      <img src={order.mandadito.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser className="text-secondary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-dark">
                      {order.mandadito?.name || 'Buscando mandadito...'}
                    </p>
                    {order.mandadito && (
                      <button
                        onClick={() => handleCallMandadito(order.mandadito?.phone)}
                        className="flex items-center gap-1 text-xs text-secondary hover:text-secondary/80 transition-colors"
                      >
                        <FiPhone className="text-xs" />
                        <span>{order.mandadito?.phone}</span>
                      </button>
                    )}
                  </div>
                </div>
                <span className={`badge ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3">{order.description}</p>
              
              <div className="space-y-1 text-sm text-gray-500 mb-4">
                <p>📍 Recoger en: {order.pickupAddress}</p>
                <p>🏠 Entregar en: {order.deliveryAddress}</p>
                <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="font-semibold text-primary">{formatCurrency(order.amount)}</span>
                
                <div className="flex gap-2">
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleConfirmReceived(order._id)}
                      disabled={confirmingId === order._id}
                      className="btn-primary text-sm py-2 px-4 flex items-center gap-1"
                    >
                      {confirmingId === order._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiCheck />
                      )}
                      Confirmar Recepción
                    </button>
                  )}
                  
                  {order.status === 'completed' && (
                    <button
                      onClick={() => handleRateOrder(order._id, order.mandadito?.name)}
                      className="btn-outline text-sm py-2 px-4 flex items-center gap-1"
                    >
                      <FiStar /> Calificar
                    </button>
                  )}
                  
                  {(order.status === 'pending' || order.status === 'accepted') && (
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <FiClock /> En proceso
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientOrders;