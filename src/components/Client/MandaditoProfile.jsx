import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiStar, FiPhone, FiArrowLeft, FiCalendar, FiUser, 
  FiMessageSquare, FiSend, FiX, FiFileText, 
  FiShield, FiTruck, FiCamera, FiCheckCircle, FiMapPin, FiClock,
  FiCheck, FiEye
} from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';
import Background from '../Layout/Background';

const MandaditoProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mandadito, setMandadito] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState('');
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
      console.log('Mandadito recibido:', response.data.mandadito);
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
      setShowModal(false);
      setOrderData({ description: '', pickupAddress: '', deliveryAddress: '' });
      navigate('/client/orders');
    } catch (error) {
      console.error('Error al asignar mandado:', error);
      toast.error(error.response?.data?.message || 'Error al asignar mandado');
    } finally {
      setSending(false);
    }
  };

  const openImageViewer = (imageUrl, title) => {
    setSelectedImage(imageUrl);
    setSelectedImageTitle(title);
    setShowImageModal(true);
  };

  if (loading) return <LoadingSpinner />;

  const isAvailable = mandadito?.isAvailable === true;
  const canAssign = isAvailable && mandadito?.isVerified === true;

  return (
    <Background>
      <div className="container mx-auto py-8 px-4 pb-24 md:pb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#FF6B35] mb-6 transition-colors">
          <FiArrowLeft /> Volver
        </button>
        
        {/* Perfil principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#FF6B35] to-[#4361EE] h-24" />
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 mb-4">
              <div className="w-28 h-28 rounded-full bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                  {mandadito?.profilePhoto ? (
                    <img 
                      src={mandadito.profilePhoto} 
                      alt={mandadito.name} 
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openImageViewer(mandadito.profilePhoto, 'Foto de perfil')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <FiUser className="text-4xl text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 text-center md:text-left md:ml-4 mt-4 md:mt-0">
                <h1 className="text-2xl font-bold text-gray-800">{mandadito?.name}</h1>
                <p className="text-gray-500">{mandadito?.phone}</p>
                <div className="flex justify-center md:justify-start items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={`text-lg ${i < Math.round(mandadito?.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">({mandadito?.totalRatings || 0} calificaciones)</span>
                </div>
                
                {mandadito?.workSchedule?.enabled && (
                  <div className="flex justify-center md:justify-start items-center gap-2 mt-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full inline-flex">
                    <FiClock className="text-sm" />
                    <span>Horario: {mandadito.workSchedule.startTime} - {mandadito.workSchedule.endTime}</span>
                  </div>
                )}
                
                {mandadito?.isVerified && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <FiCheckCircle className="text-xs" /> Verificado
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <button onClick={handleCall} className="bg-[#4361EE] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#2c4a9e] transition-colors">
                  <FiPhone /> Llamar
                </button>
                <button onClick={handleWhatsApp} className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-600 transition-colors">
                  <FiMessageSquare /> WhatsApp
                </button>
                {canAssign ? (
                  <button onClick={() => setShowModal(true)} className="bg-[#FF6B35] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#e55a2b] transition-colors">
                    <FiSend /> Asignar
                  </button>
                ) : (
                  <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded-xl flex items-center gap-2 cursor-not-allowed">
                    <FiSend /> No disponible
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-sm mt-2">
              {mandadito?.isVerified === false ? (
                <span className="text-yellow-500 bg-yellow-50 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  🟡 Pendiente de verificación por el administrador
                </span>
              ) : isAvailable ? (
                <span className="text-green-500 bg-green-50 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  🟢 <FiCheck className="text-sm" /> Disponible para mandados
                </span>
              ) : (
                <span className="text-red-500 bg-red-50 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  🔴 No disponible en este momento
                </span>
              )}
            </div>
            
            {!isAvailable && mandadito?.isVerified && (
              <p className="text-xs text-gray-500 mt-2">
                El mandadito ha desactivado su disponibilidad o está fuera de su horario laboral.
              </p>
            )}
          </div>
        </div>
        
        {/* Fotos del vehículo */}
        {mandadito?.motoPhotos?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiTruck className="text-[#FF6B35]" /> Fotos del vehículo
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {mandadito.motoPhotos.map((photo, idx) => (
                <div 
                  key={idx} 
                  className="relative group cursor-pointer rounded-xl overflow-hidden border border-gray-200"
                  onClick={() => openImageViewer(photo, `Foto del vehículo ${idx + 1}`)}
                >
                  <img src={photo} alt={`Vehículo ${idx + 1}`} className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiEye className="text-white text-2xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Documentos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiFileText className="text-[#FF6B35]" /> Documentos verificados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {mandadito?.cedulaPhoto && (
              <div className="border border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => openImageViewer(mandadito.cedulaPhoto, 'Cédula')}>
                <FiFileText className="text-3xl text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Cédula</p>
                <p className="text-xs text-gray-400 mt-1">Haz clic para ver</p>
              </div>
            )}
            {mandadito?.seguroPhoto && (
              <div className="border border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => openImageViewer(mandadito.seguroPhoto, 'Seguro')}>
                <FiShield className="text-3xl text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Seguro</p>
                <p className="text-xs text-gray-400 mt-1">Haz clic para ver</p>
              </div>
            )}
            {mandadito?.licenciaPhoto && (
              <div className="border border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => openImageViewer(mandadito.licenciaPhoto, 'Licencia de conducir')}>
                <FiCamera className="text-3xl text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Licencia</p>
                <p className="text-xs text-gray-400 mt-1">Haz clic para ver</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Calificaciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📝 Calificaciones</h2>
          {ratings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aún no hay calificaciones</p>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating._id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{rating.client?.name || 'Cliente'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={`text-sm ${i < rating.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FiCalendar className="text-xs" /> {formatDate(rating.createdAt)}
                    </span>
                  </div>
                  {rating.comment && <p className="text-gray-600 text-sm mt-2 italic">"{rating.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL para asignar mandado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-[#FF6B35] to-[#4361EE] px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <FiSend className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Asignar Mandado</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                <FiX className="text-2xl" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-r from-[#FF6B35]/10 to-[#4361EE]/10 rounded-xl p-4 mb-4">
                <p className="text-gray-700 text-sm flex items-center gap-2">
                  <FiUser className="text-[#FF6B35]" />
                  Asignando a: <span className="font-semibold text-gray-900">{mandadito?.name}</span>
                </p>
              </div>
              <form onSubmit={handleAssignOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                  <textarea name="description" value={orderData.description} onChange={handleOrderChange} className="input-field" rows="3" placeholder="Ej: Traer almuerzo..." required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de recogida *</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" name="pickupAddress" value={orderData.pickupAddress} onChange={handleOrderChange} className="input-field pl-10" placeholder="Dirección" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de entrega *</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" name="deliveryAddress" value={orderData.deliveryAddress} onChange={handleOrderChange} className="input-field pl-10" placeholder="Dirección" required />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Costo:</span>
                    <span className="font-bold text-[#FF6B35] text-lg">C$ 5.00</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">*Se descuenta del crédito al aceptar</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl hover:bg-gray-50 text-sm">Cancelar</button>
                  <button type="submit" disabled={sending} className="flex-1 bg-[#FF6B35] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e55a2b] disabled:opacity-50 text-sm">
                    {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSend /> Enviar</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL para ver imágenes */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowImageModal(false)} 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
            >
              <FiX className="text-3xl" />
            </button>
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-3">
                <h3 className="text-white font-semibold">{selectedImageTitle}</h3>
              </div>
              <div className="p-4 flex justify-center items-center bg-black/50" style={{ minHeight: '400px' }}>
                <img 
                  src={selectedImage} 
                  alt={selectedImageTitle} 
                  className="max-w-full max-h-[70vh] object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/500?text=Error+al+cargar+imagen';
                  }}
                />
              </div>
              <div className="bg-gray-100 px-6 py-3 text-center">
                <p className="text-sm text-gray-600">Haz clic fuera de la imagen para cerrar</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Background>
  );
};

export default MandaditoProfile;