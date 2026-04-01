import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiHome, FiPackage, FiDollarSign, FiUsers, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const { user, logout, isClient, isMandadito, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = () => {
    if (isClient) {
      return [
        { to: '/client/orders', icon: FiPackage, label: 'Mis Órdenes' },
        { to: '/client/create-order', icon: FiHome, label: 'Crear Mandado' },
        { to: '/client/mandaditos', icon: FiUsers, label: 'Mandaditos' },
      ];
    }
    if (isMandadito) {
      return [
        { to: '/mandadito/dashboard', icon: FiHome, label: 'Dashboard' },
        { to: '/mandadito/pending', icon: FiMapPin, label: 'Pendientes' },
        { to: '/mandadito/orders', icon: FiPackage, label: 'Mis Órdenes' },
        { to: '/mandadito/earnings', icon: FiDollarSign, label: 'Ganancias' },
        { to: '/mandadito/recharge', icon: FiDollarSign, label: 'Recargar' },
      ];
    }
    if (isAdmin) {
      return [
        { to: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
        { to: '/admin/deposits', icon: FiUsers, label: 'Depósitos' },
        { to: '/admin/users', icon: FiUsers, label: 'Usuarios' },
        { to: '/admin/report', icon: FiDollarSign, label: 'Reportes' },
      ];
    }
    return [];
  };

  const links = navLinks();

  return (
    <>
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
              <img 
                src={logo} 
                alt="Pueblo Click" 
                className="h-12 w-auto" 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/48?text=PC';
                }}
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {user && links.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigation(link.to)}
                  className={`px-5 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${
                    isActive(link.to) ? 'bg-[#E6392E] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <link.icon className="text-xl" />
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop Logout */}
            {user && (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-xl"
              >
                <FiLogOut /> Salir
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 text-gray-700"
            >
              {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Mejorado */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="bg-white w-80 h-full ml-auto shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <img src={logo} alt="Logo" className="h-12 w-auto" />
              <button onClick={() => setIsMenuOpen(false)} className="p-2">
                <FiX size={32} />
              </button>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#E6392E] flex items-center justify-center text-white text-3xl font-bold">
                        {user.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.phone}</p>
                    {isMandadito && (
                      <p className="text-[#E6392E] font-medium mt-1">Crédito: C${user.credit || 0}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex-1 p-4 space-y-1">
              {links.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigation(link.to)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left font-medium transition-all ${
                    isActive(link.to) ? 'bg-[#E6392E]/10 text-[#E6392E]' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <link.icon className="text-2xl" />
                  {link.label}
                </button>
              ))}
            </div>

            {/* Cerrar Sesión - Visible y Arriba */}
            <div className="p-6 border-t mt-auto">
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
              >
                <FiLogOut className="text-xl" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;