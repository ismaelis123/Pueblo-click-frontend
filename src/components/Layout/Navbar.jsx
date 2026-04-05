import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiHome, FiPackage, FiDollarSign, FiUsers, FiMapPin, FiUser, FiBell } from 'react-icons/fi';
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
      {/* Navbar principal */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group" onClick={() => setIsMenuOpen(false)}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#4361EE] flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base sm:text-xl">PC</span>
              </div>
              <div className="hidden xs:block">
                <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#4361EE] bg-clip-text text-transparent">
                  Pueblo Click
                </span>
                <p className="text-xs text-gray-500 hidden sm:block">Rápido y Confiable</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {user && links.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigation(link.to)}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#4361EE] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <link.icon className="text-lg" />
                  <span className="text-sm font-medium">{link.label}</span>
                </button>
              ))}
            </div>

            {/* User Menu Desktop */}
            {user && (
              <div className="hidden md:flex items-center gap-3 lg:gap-4">
                <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <FiBell className="text-xl text-gray-500" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF6B35] rounded-full animate-pulse" />
                </button>
                
                <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-3 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B35]/10 to-[#4361EE]/10 flex items-center justify-center overflow-hidden">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="text-[#FF6B35]" />
                      )}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      {isMandadito && (
                        <p className="text-xs text-[#FF6B35]">Crédito: C${user.credit}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                  >
                    <FiLogOut />
                    <span className="text-sm">Salir</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Menu Button - Hamburguesa */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Slide from right con Cerrar Sesión debajo de los links */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay oscuro */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          
          {/* Panel del menú */}
          <div className="fixed top-0 right-0 w-4/5 max-w-sm h-full bg-white shadow-2xl animate-slide-in-right flex flex-col">
            {/* Header del menú móvil */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#FF6B35]/5 to-[#4361EE]/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#4361EE] flex items-center justify-center overflow-hidden shadow-md">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="text-white text-2xl" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{user?.name}</p>
                  {isMandadito && (
                    <p className="text-sm text-[#FF6B35] font-medium">💰 Crédito: C${user?.credit}</p>
                  )}
                  {isClient && (
                    <p className="text-sm text-[#4361EE] font-medium">👤 Cliente</p>
                  )}
                  {isAdmin && (
                    <p className="text-sm text-[#FF6B35] font-medium">👑 Administrador</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Links del menú */}
            <div className="py-2">
              {links.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigation(link.to)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 transition-all ${
                    isActive(link.to)
                      ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#4361EE]/10 text-[#FF6B35] border-r-3 border-[#FF6B35]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className="text-xl" />
                  <span className="font-medium text-base">{link.label}</span>
                </button>
              ))}
            </div>
            
            {/* Botón de Cerrar Sesión - JUSTO DEBAJO DE LOS LINKS, ANTES DEL FINAL */}
            <div className="p-4 border-t border-gray-100 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-red-500 font-semibold bg-red-50 hover:bg-red-100 rounded-xl transition-all"
              >
                <FiLogOut className="text-xl" />
                <span className="text-base">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;