import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiPhone, FiLock, FiCamera, FiTruck, FiUserPlus, 
  FiFileText, FiShield, FiCreditCard, FiInfo 
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

const RegisterMandadito = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [motoPhotos, setMotoPhotos] = useState([]);
  const [cedulaPhoto, setCedulaPhoto] = useState(null);
  const [seguroPhoto, setSeguroPhoto] = useState(null);
  const [licenciaPhoto, setLicenciaPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePhoto = (e) => setProfilePhoto(e.target.files[0]);
  const handleMotoPhotos = (e) => setMotoPhotos([...e.target.files]);
  const handleCedulaPhoto = (e) => setCedulaPhoto(e.target.files[0]);
  const handleSeguroPhoto = (e) => setSeguroPhoto(e.target.files[0]);
  const handleLicenciaPhoto = (e) => setLicenciaPhoto(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!profilePhoto) {
      toast.error('Debes subir una foto de perfil');
      return;
    }

    if (motoPhotos.length === 0) {
      toast.error('Debes subir al menos una foto del vehículo');
      return;
    }

    if (!cedulaPhoto) {
      toast.error('Debes subir una foto de la cédula');
      return;
    }

    if (!seguroPhoto) {
      toast.error('Debes subir una foto del seguro');
      return;
    }

    if (!licenciaPhoto) {
      toast.error('Debes subir una foto de la licencia de conducir');
      return;
    }

    setLoading(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('profilePhoto', profilePhoto);
    
    motoPhotos.forEach(photo => {
      formDataToSend.append('motoPhotos', photo);
    });
    
    formDataToSend.append('cedulaPhoto', cedulaPhoto);
    formDataToSend.append('seguroPhoto', seguroPhoto);
    formDataToSend.append('licenciaPhoto', licenciaPhoto);

    try {
      const response = await api.post('/auth/register/mandadito', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(response.data.message || '¡Registro exitoso! Recibiste 15 córdobas de crédito.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-[#E63946] to-[#1E3A8A] px-6 py-8 text-center">
            <h1 className="text-2xl font-bold text-white">Registro Mandadito</h1>
            <p className="text-white/80 mt-1">Únete a nuestro equipo de repartidores</p>
            <div className="mt-2 inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm">
              🎁 Crédito inicial: C$15
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Datos personales */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <FiUser className="text-[#E63946]" /> Datos personales
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="50512345678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            {/* Fotos del perfil y vehículo */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <FiCamera className="text-[#E63946]" /> Fotos de perfil y vehículo
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto de perfil *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhoto}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E63946] file:text-white hover:file:bg-opacity-90"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fotos del vehículo (máx 2) *</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMotoPhotos}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1E3A8A] file:text-white hover:file:bg-opacity-90"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">{motoPhotos.length} archivo(s) seleccionado(s)</p>
              </div>
            </div>

            {/* Documentos */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <FiFileText className="text-[#E63946]" /> Documentos requeridos
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto de cédula *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCedulaPhoto}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2ECC71] file:text-white hover:file:bg-opacity-90"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto del seguro *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSeguroPhoto}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F39C12] file:text-white hover:file:bg-opacity-90"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto de licencia de conducir *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLicenciaPhoto}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1E3A8A] file:text-white hover:file:bg-opacity-90"
                  required
                />
              </div>
            </div>

            {/* Nota importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <FiInfo className="text-blue-500 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Tus documentos serán verificados por el administrador antes de que puedas aceptar mandados. 
                  Este proceso puede tomar hasta 24 horas.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiUserPlus />
                  Registrarme como Mandadito
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-[#E63946] hover:underline font-medium">
                  Inicia Sesión
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Background>
  );
};

export default RegisterMandadito;