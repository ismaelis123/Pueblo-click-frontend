import React, { useState, useEffect } from 'react';
import { FiStar, FiPhone, FiUser, FiEye, FiMapPin } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

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
      setMandaditos(response.data);
    } catch (error) {
      console.error('Error al cargar mandaditos:', error);
      toast.error('Error al cargar mandaditos disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleCallMandadito = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error('No hay número de teléfono disponible');
    }
  };

  const handleViewProfile = (id) => {
    navigate(`/client/mandadito/${id}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-20 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text mb-2">🚚 Mandaditos Disponibles</h1>
        <p className="text-gray-500">Elige a quién quieres contactar para tu mandado</p>
      </div>
      
      {mandaditos.length === 0 ? (
        <div className="card text-center py-12">
          <FiMapPin className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay mandaditos disponibles en este momento</p>
          <p className="text-sm text-gray-400 mt-2">Intenta más tarde o crea un mandado público</p>
          <button
            onClick={() => navigate('/client/create-order')}
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            Crear Mandado Público
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mandaditos.map((mandadito) => (
            <div 
              key={mandadito._id} 
              className="card hover:shadow-medium transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                {/* Foto de perfil */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                  {mandadito.profilePhoto ? (
                    <img 
                      src={mandadito.profilePhoto} 
                      alt={mandadito.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/64?text=User';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser className="text-3xl text-primary" />
                    </div>
                  )}
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text text-lg truncate">{mandadito.name}</h3>
                  
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`text-sm ${
                          i < Math.round(mandadito.rating || 0)
                            ? 'text-accent fill-accent'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      ({mandadito.totalRatings || 0})
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-1 truncate">{mandadito.phone}</p>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleCallMandadito(mandadito.phone)}
                    className="p-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors"
                    title="Llamar"
                  >
                    <FiPhone className="text-lg" />
                  </button>
                  
                  <button
                    onClick={() => handleViewProfile(mandadito._id)}
                    className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                    title="Ver perfil"
                  >
                    <FiEye className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MandaditosList;