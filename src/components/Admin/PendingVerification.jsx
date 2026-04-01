import React, { useState, useEffect } from 'react';
import { 
  FiUser, FiPhone, FiCheck, FiX, FiEye, 
  FiFileText, FiShield, FiCamera, FiTruck 
} from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

const PendingVerification = () => {
  const [mandaditos, setMandaditos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMandadito, setSelectedMandadito] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const response = await api.get('/admin/mandaditos/pending');
      setMandaditos(response.data);
    } catch (error) {
      toast.error('Error al cargar mandaditos pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, approved) => {
    setVerifyingId(userId);
    try {
      const message = approved 
        ? 'Documentos verificados. Ya puede aceptar mandados.' 
        : 'Documentos no aprobados. Por favor revisa los requisitos.';
      
      await api.put('/admin/mandaditos/verify', { userId, approved, message });
      toast.success(approved ? 'Mandadito verificado' : 'Mandadito rechazado');
      fetchPending();
      setSelectedMandadito(null);
    } catch (error) {
      toast.error('Error al verificar');
    } finally {
      setVerifyingId(null);
    }
  };

  const openModal = (mandadito) => {
    setSelectedMandadito(mandadito);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Background>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verificación de Mandaditos</h1>
        <p className="text-gray-500 mb-6">Revisa los documentos de los nuevos repartidores</p>
        
        {mandaditos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FiCheck className="text-5xl text-green-500 mx-auto mb-3" />
            <p className="text-gray-500">No hay mandaditos pendientes de verificación</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mandaditos.map((mandadito) => (
              <div key={mandadito._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-[#E63946] to-[#1E3A8A] h-20" />
                <div className="px-5 pb-5">
                  <div className="flex justify-center -mt-10 mb-3">
                    <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                        {mandadito.profilePhoto ? (
                          <img 
                            src={mandadito.profilePhoto} 
                            alt={mandadito.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiUser className="text-2xl text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-center font-bold text-gray-800 text-lg">{mandadito.name}</h3>
                  <p className="text-center text-gray-500 text-sm flex items-center justify-center gap-1">
                    <FiPhone className="text-xs" /> {mandadito.phone}
                  </p>
                  
                  <div className="flex justify-center gap-1 mt-2">
                    {mandadito.motoPhotos?.length > 0 && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">📸 Vehículo</span>
                    )}
                    {mandadito.cedulaPhoto && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">🆔 Cédula</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openModal(mandadito)}
                      className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors"
                    >
                      <FiEye /> Ver
                    </button>
                    <button
                      onClick={() => handleVerify(mandadito._id, true)}
                      disabled={verifyingId === mandadito._id}
                      className="flex-1 bg-green-500 text-white py-2 rounded-xl flex items-center justify-center gap-1 hover:bg-green-600 transition-colors"
                    >
                      {verifyingId === mandadito._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiCheck /> Aprobar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Modal para ver documentos */}
        {selectedMandadito && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMandadito(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Documentos de {selectedMandadito.name}</h2>
                <button onClick={() => setSelectedMandadito(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <FiX className="text-xl" />
                </button>
              </div>
              
              <div className="p-5 space-y-5">
                {/* Foto de perfil */}
                <div>
                  <h3 className="font-semibold mb-2">Foto de perfil</h3>
                  <img src={selectedMandadito.profilePhoto} alt="Perfil" className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-gray-200" />
                </div>
                
                {/* Fotos del vehículo */}
                {selectedMandadito.motoPhotos?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><FiTruck /> Fotos del vehículo</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedMandadito.motoPhotos.map((photo, idx) => (
                        <img key={idx} src={photo} alt={`Moto ${idx + 1}`} className="rounded-xl border border-gray-200" />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Documentos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedMandadito.cedulaPhoto && (
                    <div>
                      <h3 className="font-semibold mb-1 text-sm flex items-center gap-1"><FiFileText /> Cédula</h3>
                      <img src={selectedMandadito.cedulaPhoto} alt="Cédula" className="rounded-xl border border-gray-200" />
                    </div>
                  )}
                  {selectedMandadito.seguroPhoto && (
                    <div>
                      <h3 className="font-semibold mb-1 text-sm flex items-center gap-1"><FiShield /> Seguro</h3>
                      <img src={selectedMandadito.seguroPhoto} alt="Seguro" className="rounded-xl border border-gray-200" />
                    </div>
                  )}
                  {selectedMandadito.licenciaPhoto && (
                    <div>
                      <h3 className="font-semibold mb-1 text-sm flex items-center gap-1"><FiCamera /> Licencia</h3>
                      <img src={selectedMandadito.licenciaPhoto} alt="Licencia" className="rounded-xl border border-gray-200" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t p-4 flex gap-3">
                <button
                  onClick={() => handleVerify(selectedMandadito._id, true)}
                  className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleVerify(selectedMandadito._id, false)}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Background>
  );
};

export default PendingVerification;