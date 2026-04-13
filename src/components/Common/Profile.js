import React from 'react';
import { FiStar, FiUser, FiCreditCard, FiClock, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Background from '../Layout/Background';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Background>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-[#FF6B35] to-[#4361EE] h-24" />
            
            {/* Foto de perfil */}
            <div className="px-6 pb-6">
              <div className="flex justify-center -mt-12 mb-4">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FF6B35]/20 to-[#4361EE]/20 flex items-center justify-center overflow-hidden">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <FiUser className="text-4xl text-[#FF6B35]" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
                <p className="text-gray-500">{user?.phone}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Rol: {user?.role === 'client' ? 'Cliente' : user?.role === 'mandadito' ? 'Mandadito' : 'Administrador'}
                </p>
              </div>
            </div>
            
            {/* Información adicional */}
            <div className="border-t border-gray-100 p-6 space-y-4">
              {user?.role === 'mandadito' && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
                        <FiCreditCard className="text-[#FF6B35] text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Crédito disponible</p>
                        <p className="font-bold text-[#FF6B35] text-lg">C${user?.credit || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  {user?.workSchedule?.enabled && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#4361EE]/10 flex items-center justify-center">
                          <FiClock className="text-[#4361EE] text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Horario laboral</p>
                          <p className="text-sm text-gray-700">
                            {user.workSchedule.startTime} - {user.workSchedule.endTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user?.isVerified && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <FiMapPin className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estado de verificación</p>
                        <p className="text-sm text-green-600 font-medium">✅ Verificado</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {user?.role === 'client' && (
                <div className="flex items-center justify-center text-gray-500">
                  <p>Cliente desde {new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              
              {user?.rating > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 text-center mb-2">Calificación</p>
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={i < Math.round(user.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">({user.totalRatings || 0})</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default Profile;