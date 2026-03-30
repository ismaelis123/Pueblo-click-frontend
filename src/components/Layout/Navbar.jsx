import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiHome, FiPackage, FiDollarSign, FiUsers, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';   // ← Tu logo real

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
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Real */}
            <Link to="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
              <img 
                src={logo} 
                alt="Pueblo Click" 
                className="h-11 w-auto" 
              />
              <span className="text-xl font-bold text-[#1E3A8A] hidden sm:block">
                Pueblo Click
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {user && links.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigation(link.to)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${isActive(link.to) 
                      ? 'bg-[#E6392E] text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <link.icon className="text-lg" />
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop User Info + Logout */}
            {user && (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white shadow">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#E6392E] flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-800">{user.name?.split(' ')[0]}</p>
                    {isMandadito && (
                      <p className="text-xs text-[#E6392E]">C${user.credit || 0}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <FiLogOut />
                  <span className="font-medium">Salir</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 rounded-xl text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Mejorado */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl animate-slide-in-right overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header del menú móvil */}
            <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-[#E6392E]/5 to-white">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
                <span className="font-bold text-xl text-[#1E3A8A]">Pueblo Click</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2">
                <FiX size={28} />
              </button>
            </div>

            {/* Info del usuario */}
            <div className="p-5 border-b">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#E6392E] flex items-center justify-center text-white text-2xl">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.phone}</p>
                  {isMandadito && (
                    <p className="text-[#E6392E] font-medium">Crédito: C${user?.credit || 0}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Enlaces */}
            <div className="py-2">
              {links.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigation(link.to)}
                  className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all
                    ${isActive(link.to) 
                      ? 'bg-[#E6392E]/10 text-[#E6392E] border-r-4 border-[#E6392E]' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <link.icon className="text-2xl" />
                  <span className="font-medium text-base">{link.label}</span>
                </button>
              ))}
            </div>

            {/* Cerrar Sesión - Ahora arriba del todo en móvil */}
            <div className="absolute bottom-6 left-0 right-0 px-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-4 rounded-2xl transition-all"
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