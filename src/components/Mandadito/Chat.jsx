import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiArrowLeft, FiUser, FiCheck, FiCheckCircle, FiMessageCircle } from 'react-icons/fi';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

const MandaditoChat = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [order, setOrder] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      return () => socket.off('newMessage');
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/order/${orderId}`);
      setMessages(response.data);
    } catch (error) {
      toast.error('Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await api.get('/mandadito/orders');
      const found = response.data.find(o => o._id === orderId);
      setOrder(found);
    } catch (error) {
      console.error('Error fetching order');
    }
  };

  const handleNewMessage = (message) => {
    if (message.orderId === orderId) {
      setMessages(prev => [...prev, message]);
      // Reproducir sonido de notificación
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio no soportado'));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      const response = await api.post('/messages', {
        orderId,
        message: newMessage.trim()
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      toast.error('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherUser = () => {
    if (!order) return null;
    return order.client;
  };

  const otherUser = getOtherUser();

  if (loading) return <LoadingSpinner />;

  return (
    <Background>
      <div className="max-w-3xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10 p-4 flex items-center gap-3 shadow-sm">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiArrowLeft className="text-xl" />
          </button>
          <div className="w-10 h-10 rounded-full bg-[#E63946]/10 flex items-center justify-center overflow-hidden">
            {otherUser?.profilePhoto ? (
              <img src={otherUser.profilePhoto} alt={otherUser.name} className="w-full h-full object-cover" />
            ) : (
              <FiUser className="text-[#E63946]" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800">{otherUser?.name || 'Cliente'}</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">
                {order?.status === 'completed' ? 'Orden completada' : 
                 order?.status === 'accepted' ? 'En camino - pregunta los detalles' : 
                 order?.status === 'delivered' ? 'Entregado - espera confirmación' : 
                 'En proceso'}
              </p>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
          </div>
          {order?.status === 'accepted' && (
            <div className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
              🚚 En camino
            </div>
          )}
        </div>

        {/* Mensaje de ayuda */}
        <div className="bg-blue-50 border-b border-blue-100 p-3 text-center">
          <p className="text-sm text-blue-700 flex items-center justify-center gap-2">
            <FiMessageCircle />
            Pregunta los detalles: ¿cuántos productos? ¿alguna especificación?
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <FiMessageCircle className="text-4xl mx-auto mb-2" />
              <p>No hay mensajes aún</p>
              <p className="text-sm">Envía un mensaje para coordinar el mandado</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.sender?._id === user?._id;
              return (
                <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isOwn ? 'bg-[#E63946] text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
                    <p className="text-sm break-words">{msg.message}</p>
                    <div className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                      {formatDate(msg.createdAt)}
                      {isOwn && msg.read && <FiCheckCircle className="text-xs" />}
                      {isOwn && !msg.read && <FiCheck className="text-xs" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="bg-white border-t p-3 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 input-field py-2"
            disabled={order?.status === 'completed'}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim() || order?.status === 'completed'}
            className="bg-[#E63946] text-white px-5 rounded-xl hover:bg-[#c92a2a] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSend />}
          </button>
        </form>
        
        {order?.status === 'completed' && (
          <div className="bg-green-50 text-green-600 text-center py-2 text-sm">
            ✅ Esta orden ya fue completada. No se pueden enviar más mensajes.
          </div>
        )}

        {/* Sugerencias rápidas para mandadito */}
        {order?.status !== 'completed' && (
          <div className="bg-gray-50 border-t p-2 flex gap-2 overflow-x-auto">
            {['¿Cuántos productos?', '¿Algún cambio?', '¿Dónde te encuentras?', 'Ya casi llego', 'Confirmar entrega', '¿Me puedes confirmar la dirección?'].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => setNewMessage(suggestion)}
                className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full hover:border-[#E63946] hover:text-[#E63946] transition-colors whitespace-nowrap"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </Background>
  );
};

export default MandaditoChat;