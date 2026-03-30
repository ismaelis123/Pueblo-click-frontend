import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPhone, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF7F0] to-[#F5F0E6] py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          
          {/* Logo Grande y Centrado */}
          <div className="flex justify-center mb-8">
            <img 
              src={logo} 
              alt="Pueblo Click" 
              className="h-24 w-auto drop-shadow-md" 
            />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Bienvenido</h2>
            <p className="text-gray-600 mt-2">Inicia sesión en tu cuenta</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-12"
                  placeholder="50512345678"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiLogIn className="text-xl" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3 text-sm">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register/client" className="text-[#E6392E] font-semibold hover:underline">
                Regístrate como Cliente
              </Link>
            </p>
            <p className="text-gray-600">
              ¿Quieres ser Mandadito?{' '}
              <Link to="/register/mandadito" className="text-[#1E3A8A] font-semibold hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;