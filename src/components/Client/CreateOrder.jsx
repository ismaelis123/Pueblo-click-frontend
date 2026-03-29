import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiArrowLeft, FiSend } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Common/LoadingSpinner';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    pickupAddress: '',
    deliveryAddress: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.pickupAddress || !formData.deliveryAddress) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/client/orders', {
        description: formData.description,
        pickupAddress: formData.pickupAddress,
        deliveryAddress: formData.deliveryAddress,
        // mandaditoId se deja vacío → es mandado público
      });

      toast.success('✅ Mandado creado correctamente. Buscando mandadito disponible...');
      navigate('/client/orders');
    } catch (error) {
      console.error('Error al crear mandado:', error);
      toast.error(error.response?.data?.message || 'Error al crear el mandado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 pb-20 md:pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6"
      >
        <FiArrowLeft /> Volver
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-dark mb-2">Crear Mandado Público</h1>
        <p className="text-gray-500 mb-6">
          Describe lo que necesitas y cualquier mandadito disponible podrá aceptarlo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Qué necesitas que hagan?
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Ej: Traer almuerzo del restaurante El Sazón (2 gallos pintos, 1 carne asada, refresco natural). También comprar pan dulce..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de recogida
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Ej: Restaurante El Sazón, frente al parque central"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de entrega
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Ej: Mi casa en Barrio San José, casa color azul número 23"
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl text-sm">
            <p className="font-medium text-primary">Costo del mandado: C$ 5.00</p>
            <p className="text-gray-500 text-xs mt-1">
              Este costo se cobrará al mandadito que acepte el pedido.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creando mandado...
              </>
            ) : (
              <>
                <FiSend />
                Crear Mandado Público
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;