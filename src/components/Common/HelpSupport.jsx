import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSend, FiAlertCircle, FiMessageSquare, FiHelpCircle, FiUser, FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';

const HelpSupport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'queja',
    subject: '',
    message: '',
    mandaditoName: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast.error('Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      await api.post('/complaints', formData);
      setSubmitted(true);
      toast.success('✅ Enviado correctamente');
    } catch (error) {
      toast.error('Error al enviar');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Background>
        <div className="max-w-md mx-auto py-12 px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSend className="text-4xl text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Enviado!</h2>
            <p className="text-gray-500 mb-6">Revisaremos tu caso lo antes posible.</p>
            <button onClick={() => { setSubmitted(false); setFormData({ type: 'queja', subject: '', message: '', mandaditoName: '' }); }} className="bg-[#FF6B35] text-white px-6 py-3 rounded-xl">
              Enviar otro
            </button>
            <button onClick={() => navigate(-1)} className="mt-3 text-gray-500 underline">
              Volver
            </button>
          </div>
        </div>
      </Background>
    );
  }

  return (
    <Background>
      <div className="max-w-2xl mx-auto py-8 px-4 pb-24">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#FF6B35] mb-6">
          <FiArrowLeft /> Volver
        </button>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ayuda y Soporte</h1>
        <p className="text-gray-500 mb-6">Reporta un problema, envía una sugerencia o pide ayuda</p>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de mensaje</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'queja', icon: FiAlertCircle, label: 'Queja', color: 'red' },
                  { value: 'sugerencia', icon: FiMessageSquare, label: 'Sugerencia', color: 'blue' },
                  { value: 'ayuda', icon: FiHelpCircle, label: 'Ayuda', color: 'green' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: item.value })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      formData.type === item.value
                        ? `border-${item.color}-400 bg-${item.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <item.icon className={`text-xl mx-auto mb-1 ${formData.type === item.value ? `text-${item.color}-500` : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${formData.type === item.value ? `text-${item.color}-700` : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]"
                placeholder="Ej: Mandadito no entregó el pedido"
                required
              />
            </div>

            {formData.type === 'queja' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del mandadito (opcional)</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="mandaditoName"
                    value={formData.mandaditoName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]"
                    placeholder="Nombre del mandadito involucrado"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]"
                placeholder="Describe tu problema o sugerencia..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6B35] text-white py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e55a2b] disabled:opacity-50 font-semibold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiSend />
              )}
              Enviar {formData.type === 'queja' ? 'Reporte' : formData.type === 'sugerencia' ? 'Sugerencia' : 'Solicitud'}
            </button>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <FiHelpCircle className="text-blue-500 text-xl mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800">¿Necesitas ayuda inmediata?</p>
              <p className="text-sm text-blue-600 mt-1">Contactanos directamente:</p>
              <p className="text-blue-700 font-medium mt-1">📱 85202908</p>
              <p className="text-blue-700 font-medium">📧 i37993716@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default HelpSupport;