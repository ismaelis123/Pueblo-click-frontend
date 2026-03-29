import React from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">PC</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text">Pueblo Click</h1>
              <p className="text-xs text-gray-500">Juigalpa, Chontales</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative">
              <FiBell className="text-xl text-gray-500 hover:text-primary transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <FiUser className="text-primary" />
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-text">{user?.name?.split(' ')[0]}</p>
                {user?.role === 'mandadito' && (
                  <p className="text-xs text-secondary">Crédito: C${user?.credit}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;