import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPhone, FiLock, FiLogIn, FiArrowRight, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'client') navigate('/client/orders');
      else if (user.role === 'mandadito') navigate('/mandadito/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(phone, password);
    setLoading(false);
    
    if (result.success) {
      if (result.user.role === 'client') navigate('/client/orders');
      else if (result.user.role === 'mandadito') navigate('/mandadito/dashboard');
      else if (result.user.role === 'admin') navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/5 via-transparent to-[#4361EE]/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF6B35]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#4361EE]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-md w-full relative z-10 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* LOGO GRANDE - IMAGEN COMPLETA */}
          <div className="bg-gradient-to-br from-[#FF6B35] to-[#4361EE] px-6 pt-8 pb-6 text-center">
            {/* Logo real - imagen completa */}
            <div className="flex justify-center mb-4">
              <img 
                src={logo} 
                alt="Pueblo Click" 
                className="w-48 h-auto mx-auto drop-shadow-xl"
                style={{ maxWidth: '80%' }}
              />
            </div>
            
            {/* Lema */}
            <p className="text-white/90 text-sm font-medium tracking-wide mt-2">Rápido y Confiable</p>
            
            {/* Línea decorativa */}
            <div className="w-12 h-0.5 bg-white/30 mx-auto mt-3 rounded-full" />
            
            {/* Ubicación */}
            <p className="text-white/70 text-xs mt-3 flex items-center justify-center gap-1">
              <span>📍</span> Juigalpa, Chontales
            </p>
          </div>

          {/* Formulario */}
          <form className="p-6 space-y-5" onSubmit={handleSubmit}>
            <div className="text-center mb-2">
              <h2 className="text-xl font-semibold text-gray-800">Bienvenido</h2>
              <p className="text-sm text-gray-500">Inicia sesión en tu cuenta</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B35] text-lg" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all text-gray-800 placeholder:text-gray-400"
                  placeholder="50512345678"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4361EE] text-lg" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all text-gray-800 placeholder:text-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center space-y-2 pt-2">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link to="/register/client" className="text-[#FF6B35] font-semibold hover:underline">
                  Regístrate como Cliente
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                ¿Quieres ser Mandadito?{' '}
                <Link to="/register/mandadito" className="text-[#4361EE] font-semibold hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
          
          {/* Footer con seguridad */}
          <div className="border-t border-gray-100 p-4 text-center bg-gray-50/50">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <FiShield className="text-xs" /> Tus datos están seguros
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;