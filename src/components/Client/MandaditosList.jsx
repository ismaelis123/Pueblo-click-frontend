import React, { useState, useEffect } from 'react';
import { FiStar, FiPhone, FiUser, FiEye, FiMapPin, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

const MandaditosList = () => {
  const [mandaditos, setMandaditos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMandaditos();
  }, []);

  const fetchMandaditos = async () => {
    try {
      const response = await api.get('/client/mandaditos');
      console.log('Mandaditos recibidos:', response.data);
      setMandaditos(response.data);
    } catch (error) {
      console.error('Error al cargar mandaditos:', error);
      toast.error('Error al cargar mandaditos disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleCallMandadito = (phone) => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleViewProfile = (id) => {
    navigate(`/client/mandadito/${id}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Background>
      <div className="container mx-auto py-6 px-4 pb-24 md:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🚚 Mandaditos Disponibles</h1>
          <p className="text-gray-500 text-sm mt-1">Elige a quién quieres contactar para tu mandado</p>
        </div>
        
        {mandaditos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <FiMapPin className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay mandaditos disponibles en este momento</p>
            <p className="text-sm text-gray-400 mt-2">Esto puede deberse a que:</p>
            <ul className="text-sm text-gray-400 mt-1 list-disc list-inside">
              <li>No hay mandaditos registrados</li>
              <li>Los mandaditos no han sido verificados por el admin</li>
              <li>Los mandaditos están fuera de su horario laboral</li>
            </ul>
            <button onClick={() => navigate('/client/create-order')} className="btn-primary mt-6 inline-flex items-center gap-2">
              Crear Mandado Público
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mandaditos.map((mandadito) => (
              <div key={mandadito._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B35]/20 to-[#4361EE]/20 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                    {mandadito.profilePhoto ? (
                      <img src={mandadito.profilePhoto} alt={mandadito.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiUser className="text-3xl text-[#FF6B35]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg truncate">{mandadito.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`text-sm ${i < Math.round(mandadito.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">({mandadito.totalRatings || 0})</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">{mandadito.phone}</p>
                    {mandadito.workSchedule?.enabled && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                        <FiClock className="text-xs" />
                        <span>{mandadito.workSchedule.startTime} - {mandadito.workSchedule.endTime}</span>
                      </div>
                    )}
                    {mandadito.isVerified && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-blue-500">
                        <FiCheckCircle className="text-xs" />
                        <span>Verificado</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleCallMandadito(mandadito.phone)} className="p-3 bg-[#4361EE] text-white rounded-xl hover:bg-[#2c4a9e] transition-colors" title="Llamar">
                      <FiPhone className="text-lg" />
                    </button>
                    <button onClick={() => handleViewProfile(mandadito._id)} className="p-3 bg-[#FF6B35] text-white rounded-xl hover:bg-[#e55a2b] transition-colors" title="Ver perfil">
                      <FiEye className="text-lg" />
                    </button>
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

export default MandaditosList;