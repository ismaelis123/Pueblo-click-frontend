import React, { useState, useEffect } from 'react';
import { FiPackage, FiCheck, FiStar, FiClock, FiPhone, FiUser, FiMessageSquare, FiMapPin } from 'react-icons/fi';
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
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleOpenChat = (orderId) => {
    navigate(`/client/chat/${orderId}`);
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/client/track/${orderId}`);
  };

  const handleRateOrder = (orderId, mandaditoName) => {
    navigate('/client/rate', { state: { orderId, mandaditoName } });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Background>
      <div className="max-w-4xl mx-auto py-8 px-4 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mis Órdenes</h1>
            <p className="text-sm text-gray-500 mt-1">Sigue el estado de tus mandados</p>
          </div>
          <button
            onClick={() => navigate('/client/create-order')}
            className="bg-[#E63946] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#c92a2a] transition-colors shadow-sm flex items-center gap-2"
          >
            <FiPackage className="text-base" /> Nuevo Mandado
          </button>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="text-3xl text-gray-400" />
            </div>
            <p className="text-gray-500">No tienes órdenes aún</p>
            <p className="text-sm text-gray-400 mt-1">Crea tu primer mandado y encuentra un mandadito disponible</p>
            <button
              onClick={() => navigate('/client/create-order')}
              className="bg-[#E63946] text-white px-6 py-3 rounded-xl mt-6 hover:bg-[#c92a2a] transition-colors"
            >
              + Crear mi primer mandado
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Header con estado y datos del mandadito */}
                <div className={`px-5 py-3 flex justify-between items-center border-b ${
                  order.status === 'completed' ? 'bg-green-50 border-green-100' :
                  order.status === 'delivered' ? 'bg-blue-50 border-blue-100' :
                  order.status === 'accepted' ? 'bg-yellow-50 border-yellow-100' : 
                  order.status === 'pending_confirmation' ? 'bg-purple-50 border-purple-100' :
                  'bg-gray-50 border-gray-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border border-gray-200">
                      {order.mandadito?.profilePhoto ? (
                        <img src={order.mandadito.profilePhoto} alt={order.mandadito.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="text-gray-500 text-lg" />
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
                  <span className={`badge ${getStatusColor(order.status)} text-xs px-3 py-1`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                
                {/* Contenido de la orden */}
                <div className="p-5">
                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">{order.description}</p>
                  
                  <div className="space-y-1 text-sm text-gray-500 mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-base">📍</span>
                      <p className="flex-1">Recoger en: <span className="text-gray-600">{order.pickupAddress}</span></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-base">🏠</span>
                      <p className="flex-1">Entregar en: <span className="text-gray-600">{order.deliveryAddress}</span></p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                      <FiClock className="text-xs" /> {formatDate(order.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <span className="font-bold text-[#E63946] text-lg">{formatCurrency(order.amount)}</span>
                      <p className="text-xs text-gray-400">Costo del mandado</p>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap justify-end">
                      {/* Botón de Chat - visible cuando hay mandadito asignado */}
                      {order.mandadito && order.status !== 'pending' && (
                        <button
                          onClick={() => handleOpenChat(order._id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <FiMessageSquare className="text-sm" /> Chat
                        </button>
                      )}
                      
                      {/* Botón de Seguir - cuando el mandadito está en camino */}
                      {(order.status === 'accepted' || order.status === 'delivered') && (
                        <button
                          onClick={() => handleTrackOrder(order._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <FiMapPin className="text-sm" /> Seguir
                        </button>
                      )}
                      
                      {/* Botón Confirmar Recepción */}
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => handleConfirmReceived(order._id)}
                          disabled={confirmingId === order._id}
                          className="bg-[#2ECC71] hover:bg-green-600 text-white text-sm py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          {confirmingId === order._id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiCheck className="text-sm" />
                          )}
                          Confirmar
                        </button>
                      )}
                      
                      {/* Botón Calificar */}
                      {order.status === 'completed' && (
                        <button
                          onClick={() => handleRateOrder(order._id, order.mandadito?.name)}
                          className="border border-[#E63946] text-[#E63946] hover:bg-[#E63946] hover:text-white text-sm py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <FiStar className="text-sm" /> Calificar
                        </button>
                      )}
                      
                      {/* Estado de proceso */}
                      {(order.status === 'pending' || order.status === 'pending_confirmation') && (
                        <div className="flex items-center gap-1 text-gray-400 text-sm bg-gray-50 px-3 py-2 rounded-xl">
                          <FiClock className="text-sm" /> En proceso
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