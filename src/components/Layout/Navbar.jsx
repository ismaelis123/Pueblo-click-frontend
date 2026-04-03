import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiMenu, FiX, FiLogOut, FiHome, FiPackage, FiDollarSign, 
  FiUsers, FiMapPin, FiUser, FiBell 
} from 'react-icons/fi';
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
        { to: '/admin/verify', icon: FiUser, label: 'Verificar' },
      ];
    }
    return [];
  };

  const links = navLinks();

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#1A1A2E]/90 backdrop-blur-xl border-b border-[#2A2A3E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsMenuOpen(false)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#6C63FF] flex items-center justify-center shadow-lg animate-float">
                <span className="text-white font-bold text-xl">PC</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#6C63FF] bg-clip-text text-transparent">
                  Pueblo Click
                </span>
                <p className="text-xs text-gray-400">Rápido y Confiable</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {user && links.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigation(link.to)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#6C63FF] text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <link.icon className="text-lg" />
                  <span className="text-sm font-medium">{link.label}</span>
                </button>
              ))}
            </div>

            {/* User Menu Desktop */}
            {user && (
              <div className="hidden md:flex items-center gap-4">
                <button className="relative p-2 rounded-xl hover:bg-white/10 transition-colors">
                  <FiBell className="text-xl text-gray-300" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF6B35] rounded-full animate-pulse"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-3 border-l border-[#2A2A3E]">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#6C63FF] flex items-center justify-center overflow-hidden">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="text-white" />
                      )}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      {isMandadito && (
                        <p className="text-xs text-[#00E5FF]">Crédito: C${user.credit}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <FiLogOut />
                    <span className="text-sm">Salir</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-300 hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 right-0 w-72 h-full bg-[#1A1A2E] border-l border-[#2A2A3E] shadow-2xl animate-slide-in-right">
            <div className="p-5 border-b border-[#2A2A3E] bg-gradient-to-r from-[#FF6B35]/10 to-[#6C63FF]/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#6C63FF] flex items-center justify-center overflow-hidden">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="text-white text-xl" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{user?.name}</p>
                  {isMandadito && (
                    <p className="text-sm text-[#00E5FF]">Crédito: C${user?.credit}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="py-4">
              {links.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigation(link.to)}
                  className={`w-full flex items-center gap-3 px-5 py-3 transition-all ${
                    isActive(link.to)
                      ? 'bg-gradient-to-r from-[#FF6B35]/20 to-[#6C63FF]/20 text-white border-r-2 border-[#FF6B35]'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <link.icon className="text-xl" />
                  <span className="font-medium">{link.label}</span>
                </button>
              ))}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-[#2A2A3E]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <FiLogOut className="text-xl" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;