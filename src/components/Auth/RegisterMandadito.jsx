import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiLock, FiCamera, FiTruck, FiUserPlus } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

const RegisterMandadito = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [motoPhotos, setMotoPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePhoto = (e) => {
    setProfilePhoto(e.target.files[0]);
  };

  const handleMotoPhotos = (e) => {
    setMotoPhotos([...e.target.files]);
  };

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
      toast.error('Debes subir al menos una foto de la moto');
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

    try {
      await api.post('/auth/register/mandadito', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('¡Registro exitoso! Recibiste 15 córdobas de crédito. Ahora inicia sesión.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-medium p-8">
        <div className="text-center">
          <img src={logo} alt="Pueblo Click" className="mx-auto h-16 w-16" />
          <h2 className="mt-4 text-3xl font-bold text-text">Registro Mandadito</h2>
          <p className="mt-2 text-gray-500">Únete como repartidor y gana dinero</p>
          <div className="mt-2 inline-block bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">
            🎁 Crédito inicial: C$15
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Carlos Gómez"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="50587654321"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiCamera className="inline mr-1" /> Foto de perfil
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhoto}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-opacity-90"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiTruck className="inline mr-1" /> Fotos del vehículo (máx 2)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMotoPhotos}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-opacity-90"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                {motoPhotos.length} archivo(s) seleccionado(s)
              </p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
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
              <Link to="/login" className="text-primary hover:underline font-medium">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterMandadito;