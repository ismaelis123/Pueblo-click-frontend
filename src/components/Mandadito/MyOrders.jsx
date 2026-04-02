import React, { useState, useEffect } from 'react';
import { FiCheck, FiClock, FiPackage, FiPhone, FiUser, FiTruck, FiMessageSquare, FiMapPin } from 'react-icons/fi';
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
      toast.success(response.data.message || '📦 Pedido marcado como entregado');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al marcar como entregado');
    } finally {
      setDeliveringId(null);
    }
  };

  const handleCallClient = (phone) => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleOpenChat = (orderId) => {
    navigate(`/mandadito/chat/${orderId}`);
  };

  const handleShareLocation = (orderId) => {
    navigate(`/mandadito/share-location/${orderId}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Background>
      <div className="max-w-4xl mx-auto py-8 px-4 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mis Órdenes Asignadas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona los mandados que has aceptado</p>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="text-3xl text-gray-400" />
            </div>
            <p className="text-gray-500">Aún no tienes órdenes asignadas</p>
            <p className="text-sm text-gray-400 mt-1">Revisa las órdenes pendientes y acepta alguna</p>
            <a
              href="/mandadito/pending"
              className="inline-block bg-[#E63946] text-white px-6 py-3 rounded-xl mt-6 hover:bg-[#c92a2a] transition-colors"
            >
              Ver órdenes pendientes
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Header con cliente */}
                <div className={`px-5 py-3 flex justify-between items-center border-b ${
                  order.status === 'completed' ? 'bg-green-50 border-green-100' :
                  order.status === 'delivered' ? 'bg-blue-50 border-blue-100' :
                  order.status === 'accepted' ? 'bg-yellow-50 border-yellow-100' : 
                  'bg-gray-50 border-gray-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border border-gray-200">
                      {order.client?.profilePhoto ? (
                        <img src={order.client.profilePhoto} alt={order.client.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="text-gray-500 text-lg" />
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
                      <FiClock className="text-xs" /> Creado: {formatDate(order.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <span className="font-bold text-[#E63946] text-lg">{formatCurrency(order.amount)}</span>
                      {order.status === 'accepted' && (
                        <p className="text-xs text-green-600">✓ Crédito ya descontado</p>
                      )}
                      {order.status === 'completed' && (
                        <p className="text-xs text-green-600">✓ Ganancia acreditada</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap justify-end">
                      {/* Botón de Chat */}
                      <button
                        onClick={() => handleOpenChat(order._id)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <FiMessageSquare className="text-sm" /> Chat
                      </button>
                      
                      {/* Botón Compartir Ubicación - cuando la orden está aceptada */}
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleShareLocation(order._id)}
                          className="bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <FiMapPin className="text-sm" /> Compartir ubicación
                        </button>
                      )}
                      
                      {/* Botón Marcar Entregado */}
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleDeliverOrder(order._id)}
                          disabled={deliveringId === order._id}
                          className="bg-[#2ECC71] hover:bg-green-600 text-white text-sm py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          {deliveringId === order._id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiTruck className="text-sm" />
                          )}
                          Marcar Entregado
                        </button>
                      )}
                      
                      {/* Estado de espera */}
                      {order.status === 'delivered' && (
                        <div className="flex items-center gap-1 text-yellow-600 text-sm bg-yellow-50 px-3 py-2 rounded-xl">
                          <FiClock className="text-sm" /> Esperando confirmación
                        </div>
                      )}
                      
                      {/* Estado completado */}
                      {order.status === 'completed' && (
                        <div className="flex items-center gap-1 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-xl">
                          <FiCheck className="text-sm" /> Completada
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