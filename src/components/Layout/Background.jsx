import React from 'react';
import logoBg from '../../assets/logo.png';

const Background = ({ children }) => {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-white to-gray-50">
      {/* Fondo con logo semi-transparente */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage: `url(${logoBg})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
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