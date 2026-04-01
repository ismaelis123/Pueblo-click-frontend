import React, { useState, useEffect } from 'react';
import { FiCheck, FiClock, FiPackage, FiPhone, FiUser, FiTruck, FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatDate, getStatusText, getStatusColor, formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveringId, setDeliveringId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/mandadito/orders');
      setOrders(response.data);
    } catch (error) {
      toast.error('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverOrder = async (orderId) => {
    setDeliveringId(orderId);
    try {
      const response = await api.put(`/mandadito/orders/${orderId}/deliver`);
      toast.success(response.data.message || 'Pedido marcado como entregado');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al marcar como entregado');
    } finally {
      setDeliveringId(null);
    }
  };

  const handleCallClient = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleOpenChat = (orderId) => {
    navigate(`/mandadito/chat/${orderId}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Background>
      <div className="max-w-4xl mx-auto py-8 px-4 pb-24 md:pb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Órdenes Asignadas</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aún no tienes órdenes asignadas</p>
            <a href="/mandadito/pending" className="inline-block bg-[#E63946] text-white px-6 py-3 rounded-xl mt-4 hover:bg-[#c92a2a] transition-colors">
              Ver órdenes pendientes
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header con cliente */}
                <div className={`px-5 py-3 flex justify-between items-center ${
                  order.status === 'completed' ? 'bg-green-50' :
                  order.status === 'delivered' ? 'bg-blue-50' :
                  order.status === 'accepted' ? 'bg-yellow-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {order.client?.profilePhoto ? (
                        <img src={order.client.profilePhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{order.client?.name}</p>
                      <button
                        onClick={() => handleCallClient(order.client?.phone)}
                        className="flex items-center gap-1 text-xs text-[#E63946] hover:underline"
                      >
                        <FiPhone className="text-xs" /> {order.client?.phone}
                      </button>
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                
                {/* Contenido */}
                <div className="p-5">
                  <p className="text-gray-700 mb-3">{order.description}</p>
                  
                  <div className="space-y-1 text-sm text-gray-500 mb-4">
                    <p>📍 Recoger en: {order.pickupAddress}</p>
                    <p>🏠 Entregar en: {order.deliveryAddress}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <span className="font-semibold text-[#E63946]">Ganancia: {formatCurrency(order.amount)}</span>
                      {order.status === 'accepted' && (
                        <p className="text-xs text-gray-400">*Crédito ya descontado</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {/* Botón de Chat - siempre visible cuando hay orden asignada */}
                      <button
                        onClick={() => handleOpenChat(order._id)}
                        className="bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm py-2 px-4 rounded-xl flex items-center gap-1"
                      >
                        <FiMessageSquare /> Chat
                      </button>
                      
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleDeliverOrder(order._id)}
                          disabled={deliveringId === order._id}
                          className="bg-[#2ECC71] text-white text-sm py-2 px-4 rounded-xl flex items-center gap-1 hover:bg-green-600 transition-colors"
                        >
                          {deliveringId === order._id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiTruck />
                          )}
                          Marcar Entregado
                        </button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <div className="flex items-center gap-1 text-yellow-600 text-sm bg-yellow-50 px-3 py-2 rounded-xl">
                          <FiClock /> Esperando confirmación
                        </div>
                      )}
                      
                      {order.status === 'completed' && (
                        <div className="flex items-center gap-1 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-xl">
                          <FiCheck /> Completada
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

export default MyOrders;