import React, { useState } from 'react';
import { FiDollarSign, FiSend, FiInfo, FiCopy, FiCheck, FiMessageCircle } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RechargeCredit = () => {
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const adminPhone = '85202908';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(adminPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Número copiado');
  };

  const handleWhatsAppMessage = () => {
    const message = `Hola, soy mandadito de Pueblo Click. Realicé un depósito de C$${amount} para recargar mi crédito. Referencia: ${reference || 'pendiente'}`;
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || amount < 1) {
      toast.error('Ingresa un monto válido');
      return;
    }
    
    if (!reference) {
      toast.error('Ingresa la referencia del depósito');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/mandadito/recharge', { amount: Number(amount), reference });
      toast.success(response.data.message);
      
      // Abrir WhatsApp automáticamente después de la solicitud
      const message = response.data.adminMessage;
      const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      
      setAmount('');
      setReference('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al solicitar recarga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 pb-20 md:pb-8">
      <div className="card">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiDollarSign className="text-4xl text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-dark">Solicitar Recarga</h1>
          <p className="text-gray-500 mt-1">Recarga tu crédito para seguir trabajando</p>
        </div>
        
        <div className="bg-secondary/10 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <FiInfo />
            <span className="text-sm font-medium">Instrucciones:</span>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <p>1. Realiza un depósito a la siguiente cuenta:</p>
            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <div>
                <span className="text-xs text-gray-500">Número de billetera móvil:</span>
                <p className="font-bold text-primary text-lg">{adminPhone}</p>
              </div>
              <button
                onClick={handleCopyPhone}
                className="bg-primary/10 text-primary py-2 px-3 rounded-lg flex items-center gap-1 hover:bg-primary/20 transition-colors"
              >
                {copied ? <FiCheck /> : <FiCopy />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <p>2. Ingresa el monto depositado</p>
            <p>3. Proporciona la referencia del depósito</p>
            <p>4. Envía el comprobante por WhatsApp</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a recargar (C$)
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field pl-10"
                placeholder="50"
                min="1"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referencia del depósito
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="input-field"
              placeholder="Ej: Depósito de 50 córdobas, ref 123456"
              required
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiSend />
                  Enviar
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleWhatsAppMessage}
              className="bg-green-500 text-white px-4 rounded-xl flex items-center gap-2 hover:bg-green-600 transition-colors"
            >
              <FiMessageCircle />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>El crédito se agregará manualmente después de confirmar tu depósito</p>
          <p className="mt-1">📱 Contacta al {adminPhone} para cualquier duda</p>
        </div>
      </div>
    </div>
  );
};

export default RechargeCredit;