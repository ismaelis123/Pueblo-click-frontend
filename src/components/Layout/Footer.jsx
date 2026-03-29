import React from 'react';
import { FiHome, FiPackage, FiDollarSign, FiUser, FiMapPin } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {
  const { user, isClient, isMandadito } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const clientLinks = [
    { to: '/client/orders', icon: FiPackage, label: 'Órdenes' },
    { to: '/client/create-order', icon: FiHome, label: 'Nuevo' },
    { to: '/profile', icon: FiUser, label: 'Perfil' },
  ];

  const mandaditoLinks = [
    { to: '/mandadito/dashboard', icon: FiHome, label: 'Inicio' },
    { to: '/mandadito/pending', icon: FiMapPin, label: 'Pendientes' },
    { to: '/mandadito/orders', icon: FiPackage, label: 'Mis Órdenes' },
    { to: '/mandadito/earnings', icon: FiDollarSign, label: 'Ganancias' },
  ];

  const links = isClient ? clientLinks : isMandadito ? mandaditoLinks : [];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-soft z-40 md:hidden">
      <div className="flex justify-around items-center py-2">
        {links.map((link) => {
          const active = isActive(link.to);
          const Icon = link.icon;
          return (
            <button
              key={link.to}
              onClick={() => handleNavigation(link.to)}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-all ${
                active
                  ? 'text-primary'
                  : 'text-gray-400'
              }`}
            >
              <Icon className={`text-xl ${active ? 'drop-shadow-sm' : ''}`} />
              <span className="text-xs">{link.label}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;