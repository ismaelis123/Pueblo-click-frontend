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
      if (result.user.role === 'client') {
        navigate('/client/orders');
      } else if (result.user.role === 'mandadito') {
        navigate('/mandadito/dashboard');
      } else if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-medium p-8">
        <div className="text-center">
          <img src={logo} alt="Pueblo Click" className="mx-auto h-16 w-16" />
          <h2 className="mt-4 text-3xl font-bold text-text">Bienvenido</h2>
          <p className="mt-2 text-gray-500">Inicia sesión en tu cuenta</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-10"
                  placeholder="50512345678"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiLogIn />
                Iniciar Sesión
              </>
            )}
          </button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register/client" className="text-primary hover:underline font-medium">
                Regístrate como Cliente
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              ¿Quieres ser Mandadito?{' '}
              <Link to="/register/mandadito" className="text-secondary hover:underline font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;