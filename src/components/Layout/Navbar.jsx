import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiHome, FiPackage, FiDollarSign, FiUsers, FiMapPin, FiList } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

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
      <nav className="bg-white shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setIsMenuOpen(false)}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-soft">
                <span className="text-white font-bold text-xl">PC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:block">
                Pueblo Click
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {user && links.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigation(link.to)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-primary text-white shadow-soft'
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
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="text-white" />
                      )}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-gray-700">{user.name}</p>
                      {isMandadito && (
                        <p className="text-xs text-secondary">Crédito: C${user.credit}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all"
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
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-xl animate-slide-in-right">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="text-white text-xl" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-dark">{user?.name}</p>
                  {isMandadito && (
                    <p className="text-sm text-secondary">Crédito: C${user?.credit}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="py-4">
              {links.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigation(link.to)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive(link.to)
                      ? 'bg-primary/10 text-primary border-r-4 border-primary'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className="text-xl" />
                  <span className="font-medium">{link.label}</span>
                </button>
              ))}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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