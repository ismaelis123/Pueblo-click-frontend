import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiStar, FiSend, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RateMandadito = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, mandaditoName } = location.state || {};
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!orderId) {
    navigate('/client/orders');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/client/rate', { orderId, score, comment });
      setSubmitted(true);
      toast.success('¡Gracias por calificar!');
      setTimeout(() => {
        navigate('/client/orders');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al calificar');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="card">
          <FiCheckCircle className="text-6xl text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-2">¡Calificación Enviada!</h2>
          <p className="text-gray-500">Gracias por tu feedback. Ayudas a mejorar el servicio.</p>
          <button
            onClick={() => navigate('/client/orders')}
            className="btn-primary mt-6"
          >
            Ver mis órdenes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="card text-center">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiStar className="text-4xl text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-dark mb-2">Calificar Mandadito</h2>
        <p className="text-gray-500 mb-6">¿Cómo fue tu experiencia con {mandaditoName || 'el mandadito'}?</p>
        
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setScore(star)}
                className="text-4xl transition-transform hover:scale-110 focus:outline-none"
              >
                <FiStar
                  className={star <= score ? 'text-accent fill-accent' : 'text-gray-300'}
                />
              </button>
            ))}
          </div>
          
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input-field mb-6"
            rows="4"
            placeholder="Cuéntanos tu experiencia con el mandadito..."
          />
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiSend />
                Enviar Calificación
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RateMandadito;