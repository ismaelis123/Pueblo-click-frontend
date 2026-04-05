import React from 'react';
import logoBg from '../../assets/logo.png';

const Background = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo claro con gradiente suave */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 z-0" />
      
      {/* Elementos decorativos */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#FF6B35]/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#4361EE]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#06FFA5]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Logo de fondo semi-transparente */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `url(${logoBg})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Contenido principal */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Background;