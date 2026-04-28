import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiArrowLeft, FiSend, FiZap, FiDollarSign, FiInfo, FiAlertCircle, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [showUrgentConfirm, setShowUrgentConfirm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    pickupAddress: '',
    deliveryAddress: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.pickupAddress || !formData.deliveryAddress) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (isUrgent && !showUrgentConfirm) {
      setShowUrgentConfirm(true);
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        description: formData.description,
        pickupAddress: formData.pickupAddress,
        deliveryAddress: formData.deliveryAddress,
        isUrgent: isUrgent,
      };

      const response = await api.post('/client/orders', orderData);

      const fareInfo = response.data.fareInfo;
      toast.success(
        <div>
          <p className="font-semibold">✅ Mandado creado en Juigalpa</p>
          <p className="text-sm mt-1">{fareInfo.message}</p>
          <p className="text-xs text-gray-400 mt-1">Al mandadito se le descuentan C$5 de su crédito</p>
        </div>,
        { duration: 5000 }
      );
      
      navigate('/client/orders');
    } catch (error) {
      console.error('Error al crear mandado:', error);
      toast.error(error.response?.data?.message || 'Error al crear el mandado');
    } finally {
      setLoading(false);
      setShowUrgentConfirm(false);
    }
  };

  const getFareEstimate = () => {
    if (isUrgent) return { amount: 70, label: 'Urgente', color: 'text-red-600', bg: 'bg-red-50', icon: '🚨' };
    return { amount: '30-50', label: 'Según distancia', color: 'text-[#FF6B35]', bg: 'bg-orange-50', icon: '💰' };
  };

  const fareEstimate = getFareEstimate();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 pb-20 md:pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#FF6B35] mb-6">
        <FiArrowLeft /> Volver
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
            <FiMapPin className="text-[#FF6B35] text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Crear Mandado</h1>
            <p className="text-sm text-gray-500">Solo en Juigalpa, Chontales</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Qué necesitas que hagan?
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]"
              placeholder="Ej: Traer almuerzo del restaurante El Sazón (2 gallos pintos, 1 carne asada, refresco)..."
              required
            />
          </div>

          {/* Dirección de recogida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Dirección de recogida <span className="text-xs text-gray-400">(Juigalpa)</span>
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]"
                placeholder="Ej: Restaurante El Sazón, frente al parque central, Juigalpa"
                required
              />
            </div>
          </div>

          {/* Dirección de entrega */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏠 Dirección de entrega <span className="text-xs text-gray-400">(Juigalpa)</span>
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]"
                placeholder="Ej: Barrio San José, casa azul #23, Juigalpa"
                required
              />
            </div>
          </div>

          {/* Tarifas */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FiDollarSign className="text-[#FF6B35] text-xl" />
              Tarifas en Juigalpa
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-xl p-3 border border-green-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">📍 Cerca</span>
                  <span className="font-bold text-green-600 text-lg">C$30</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Hasta 1.5 km</p>
              </div>
              
              <div className="bg-white rounded-xl p-3 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">📏 Medio</span>
                  <span className="font-bold text-blue-600 text-lg">C$40</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">1.5 a 3 km</p>
              </div>
              
              <div className="bg-white rounded-xl p-3 border border-orange-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">🛵 Largo</span>
                  <span className="font-bold text-orange-600 text-lg">C$50</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Más de 3 km</p>
              </div>
              
              <div className="bg-white rounded-xl p-3 border-2 border-red-300 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">🚨 Urgente</span>
                  <span className="font-bold text-red-600 text-lg">C$70</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Entrega prioritaria</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <FiInfo className="text-xs" />
              Al mandadito solo se le descuentan C$5 de su crédito al aceptar
            </p>
          </div>

          {/* Opción URGENTE mejorada */}
          <div className={`border-2 rounded-xl p-5 transition-all cursor-pointer ${
            isUrgent ? 'border-red-400 bg-red-50 shadow-lg' : 'border-gray-200 hover:border-red-200'
          }`} onClick={() => {
            setIsUrgent(!isUrgent);
            setShowUrgentConfirm(false);
          }}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isUrgent ? 'bg-red-200 animate-pulse' : 'bg-gray-100'
              }`}>
                <FiZap className={`text-2xl ${isUrgent ? 'text-red-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${isUrgent ? 'text-red-700' : 'text-gray-800'}`}>
                    🚨 Pedido Urgente
                  </span>
                  {isUrgent && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                      ACTIVADO
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Entrega prioritaria • Tarifa fija: C$70
                </p>
                {isUrgent && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
                    <FiClock className="animate-spin" />
                    <span>El mandadito recibirá este pedido como prioritario</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => {
                    e.stopPropagation();
                    setIsUrgent(e.target.checked);
                    setShowUrgentConfirm(false);
                  }}
                  className="sr-only peer"
                />
                <div className={`w-14 h-8 rounded-full transition-all ${
                  isUrgent ? 'bg-red-500' : 'bg-gray-200'
                } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all ${
                  isUrgent ? 'after:translate-x-6' : ''
                }`}></div>
              </div>
            </div>
          </div>

          {/* Confirmación urgente */}
          {showUrgentConfirm && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-5 animate-fade-in">
              <div className="flex items-start gap-4">
                <FiAlertCircle className="text-red-500 text-2xl flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-700 text-lg mb-2">⚠️ Confirmar Pedido Urgente</p>
                  <div className="bg-white rounded-xl p-3 mb-3">
                    <p className="text-sm text-gray-700">
                      <strong>Costo para el cliente:</strong> <span className="text-red-600 font-bold text-lg">C$70</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      El mandadito recibirá notificación prioritaria
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowUrgentConfirm(false);
                        setIsUrgent(false);
                      }} 
                      className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <FiZap /> Crear Urgente (C$70)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Costo estimado */}
          <div className={`${fareEstimate.bg} rounded-xl p-4 flex items-center justify-between border`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{fareEstimate.icon}</span>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  {isUrgent ? 'Tarifa Urgente' : 'Costo estimado'}
                </p>
                <p className="text-xs text-gray-400">Se cobrará al cliente</p>
              </div>
            </div>
            <span className={`text-2xl font-bold ${fareEstimate.color}`}>
              {typeof fareEstimate.amount === 'number' ? `C$${fareEstimate.amount}` : `C$${fareEstimate.amount}`}
            </span>
          </div>

          {/* Botón crear */}
          {!showUrgentConfirm && (
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-base font-bold transition-all ${
                isUrgent 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200' 
                  : 'bg-[#FF6B35] hover:bg-[#e55a2b] text-white'
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  {isUrgent ? <FiZap className="text-lg" /> : <FiSend className="text-lg" />}
                  {isUrgent ? 'Crear Mandado URGENTE' : 'Crear Mandado'}
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;