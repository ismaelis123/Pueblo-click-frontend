import React, { useState, useEffect } from 'react';
import { FiPackage, FiCheck, FiStar, FiClock, FiPhone, FiUser, FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatDate, getStatusText, getStatusColor, formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

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

  const handleOpenChat = (orderId) => {
    navigate(`/client/chat/${orderId}`);
  };

  const handleRateOrder = (orderId, mandaditoName) => {
    navigate('/client/rate', { state: { orderId, mandaditoName } });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Background>
      <div className="max-w-4xl mx-auto py-8 px-4 pb-24 md:pb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mis Órdenes</h1>
          <button
            onClick={() => navigate('/client/create-order')}
            className="bg-[#E63946] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#c92a2a] transition-colors"
          >
            + Nuevo Mandado
          </button>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tienes órdenes aún</p>
            <button
              onClick={() => navigate('/client/create-order')}
              className="bg-[#E63946] text-white px-6 py-3 rounded-xl mt-4 hover:bg-[#c92a2a] transition-colors"
            >
              Crear mi primer mandado
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header con estado */}
                <div className={`px-5 py-3 flex justify-between items-center ${
                  order.status === 'completed' ? 'bg-green-50' :
                  order.status === 'delivered' ? 'bg-blue-50' :
                  order.status === 'accepted' ? 'bg-yellow-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {order.mandadito?.profilePhoto ? (
                        <img src={order.mandadito.profilePhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {order.mandadito?.name || 'Buscando mandadito...'}
                      </p>
                      {order.mandadito && (
                        <button
                          onClick={() => handleCallMandadito(order.mandadito?.phone)}
                          className="flex items-center gap-1 text-xs text-[#E63946] hover:underline"
                        >
                          <FiPhone className="text-xs" /> {order.mandadito?.phone}
                        </button>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                
                {/* Contenido de la orden */}
                <div className="p-5">
                  <p className="text-gray-700 mb-3">{order.description}</p>
                  
                  <div className="space-y-1 text-sm text-gray-500 mb-4">
                    <p>📍 Recoger en: {order.pickupAddress}</p>
                    <p>🏠 Entregar en: {order.deliveryAddress}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="font-semibold text-[#E63946]">{formatCurrency(order.amount)}</span>
                    
                    <div className="flex gap-2">
                      {/* Botón de Chat - visible cuando hay mandadito asignado */}
                      {order.mandadito && order.status !== 'pending' && (
                        <button
                          onClick={() => handleOpenChat(order._id)}
                          className="bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm py-2 px-4 rounded-xl flex items-center gap-1"
                        >
                          <FiMessageSquare /> Chat
                        </button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => handleConfirmReceived(order._id)}
                          disabled={confirmingId === order._id}
                          className="bg-[#2ECC71] text-white text-sm py-2 px-4 rounded-xl flex items-center gap-1 hover:bg-green-600 transition-colors"
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
                          className="border border-[#E63946] text-[#E63946] text-sm py-2 px-4 rounded-xl flex items-center gap-1 hover:bg-[#E63946] hover:text-white transition-colors"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </Background>
  );
};

export default ClientOrders;