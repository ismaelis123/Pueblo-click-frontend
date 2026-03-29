import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiStar, FiPhone, FiArrowLeft, FiCalendar, FiUser, FiMessageSquare, FiSend, FiCheck, FiX } from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';

const MandaditoProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mandadito, setMandadito] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({
    description: '',
    pickupAddress: '',
    deliveryAddress: ''
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMandaditoProfile();
  }, [id]);

  const fetchMandaditoProfile = async () => {
    try {
      const response = await api.get(`/client/mandaditos/${id}`);
      setMandadito(response.data.mandadito);
      setRatings(response.data.ratings);
    } catch (error) {
      toast.error('Error al cargar perfil');
      navigate('/client/mandaditos');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${mandadito.phone}`;
  };

  const handleWhatsApp = () => {
    const message = `Hola ${mandadito.name}, soy cliente de Pueblo Click. ¿Estás disponible para hacer un mandado?`;
    window.open(`https://wa.me/${mandadito.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleOrderChange = (e) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  const handleAssignOrder = async (e) => {
    e.preventDefault();
    
    if (!orderData.description || !orderData.pickupAddress || !orderData.deliveryAddress) {
      toast.error('Completa todos los campos del mandado');
      return;
    }
    
    setSending(true);
    try {
      const response = await api.post('/client/orders', {
        description: orderData.description,
        pickupAddress: orderData.pickupAddress,
        deliveryAddress: orderData.deliveryAddress,
        mandaditoId: mandadito._id
      });
      
      toast.success(response.data.message || `Mandado enviado a ${mandadito.name}. Espera su confirmación.`);
      setShowOrderForm(false);
      setOrderData({ description: '', pickupAddress: '', deliveryAddress: '' });
      navigate('/client/orders');
    } catch (error) {
      console.error('Error al asignar mandado:', error);
      toast.error(error.response?.data?.message || 'Error al asignar mandado');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 pb-20 md:pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors"
      >
        <FiArrowLeft /> Volver
      </button>
      
      <div className="card text-center mb-6">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mx-auto mb-4 flex items-center justify-center overflow-hidden ring-4 ring-primary/20">
          {mandadito?.profilePhoto ? (
            <img 
              src={mandadito.profilePhoto} 
              alt={mandadito.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/128?text=User';
              }}
            />
          ) : (
            <FiUser className="text-5xl text-primary" />
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-dark">{mandadito?.name}</h1>
        <p className="text-gray-500 mb-2">{mandadito?.phone}</p>
        
        <div className="flex justify-center items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              className={`text-xl ${
                i < Math.round(mandadito?.rating || 0)
                  ? 'text-accent fill-accent'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-500">
            ({mandadito?.totalRatings || 0} calificaciones)
          </span>
        </div>
        
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={handleCall}
            className="bg-secondary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-secondary/80 transition-colors"
          >
            <FiPhone /> Llamar
          </button>
          <button
            onClick={handleWhatsApp}
            className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-600 transition-colors"
          >
            <FiMessageSquare /> WhatsApp
          </button>
          <button
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/80 transition-colors"
          >
            <FiSend /> Asignar Mandado
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          {mandadito?.isAvailable ? (
            <span className="text-green-500">🟢 Disponible para mandados</span>
          ) : (
            <span className="text-red-500">🔴 No disponible en este momento</span>
          )}
        </div>
        
        {mandadito?.motoPhotos?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-dark mb-2">Fotos del vehículo</h3>
            <div className="flex gap-2 justify-center flex-wrap">
              {mandadito.motoPhotos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Vehículo ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/96?text=Moto';
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Formulario para asignar mandado */}
      {showOrderForm && (
        <div className="card mb-6 border-2 border-primary/20">
          <h2 className="text-xl font-bold text-dark mb-2">Asignar Mandado a {mandadito?.name}</h2>
          <p className="text-sm text-gray-500 mb-4">
            El mandadito recibirá la solicitud y podrá aceptarla o rechazarla.
            {mandadito?.isAvailable ? ' Está disponible.' : ' No está disponible, pero recibirá la notificación.'}
          </p>
          
          <form onSubmit={handleAssignOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del mandado *</label>
              <textarea
                name="description"
                value={orderData.description}
                onChange={handleOrderChange}
                className="input-field"
                rows="3"
                placeholder="Ej: Traer almuerzo del restaurante El Sazón - 2 gallos pintos, 1 carne asada..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de recogida *</label>
              <input
                type="text"
                name="pickupAddress"
                value={orderData.pickupAddress}
                onChange={handleOrderChange}
                className="input-field"
                placeholder="Ej: Restaurante El Sazón, Calle Central"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de entrega *</label>
              <input
                type="text"
                name="deliveryAddress"
                value={orderData.deliveryAddress}
                onChange={handleOrderChange}
                className="input-field"
                placeholder="Ej: Barrio San José, casa 23"
                required
              />
            </div>
            
            <div className="bg-grayLight rounded-xl p-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Costo del mandado:</span>
                <span className="font-bold text-primary text-lg">C$ 5.00</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                *Se descontará del crédito del mandadito al aceptar
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowOrderForm(false)}
                className="flex-1 btn-outline"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSend /> Enviar Solicitud
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Calificaciones */}
      <div className="card">
        <h2 className="text-xl font-bold text-dark mb-4">📝 Calificaciones</h2>
        
        {ratings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aún no hay calificaciones para este mandadito</p>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating._id} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-dark">{rating.client?.name || 'Cliente'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`text-sm ${
                            i < rating.score ? 'text-accent fill-accent' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <FiCalendar className="text-xs" /> {formatDate(rating.createdAt)}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-gray-600 text-sm mt-2 italic">"{rating.comment}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MandaditoProfile;