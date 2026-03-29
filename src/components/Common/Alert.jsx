import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';

const Alert = ({ type, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const types = {
    success: {
      icon: FiCheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
    },
    error: {
      icon: FiXCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: FiAlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500',
    },
    info: {
      icon: FiInfo,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = types[type] || types.info;

  return createPortal(
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:min-w-80 z-[100] animate-slide-down">
      <div className={`${bgColor} border-l-4 ${borderColor} rounded-lg shadow-medium p-4 flex items-start gap-3`}>
        <Icon className={`${iconColor} text-xl flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`${textColor} text-sm font-medium`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Alert;