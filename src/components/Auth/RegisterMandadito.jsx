import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiPhone, FiLock, FiCamera, FiTruck, FiUserPlus, 
  FiArrowLeft, FiFileText, FiShield, FiInfo, FiClock, FiCalendar 
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Background from '../Layout/Background';
import logo from '../../assets/logo.png';

const RegisterMandadito = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [motoPhotos, setMotoPhotos] = useState([]);
  const [cedulaPhoto, setCedulaPhoto] = useState(null);
  const [seguroPhoto, setSeguroPhoto] = useState(null);
  const [licenciaPhoto, setLicenciaPhoto] = useState(null);
  
  // Horario de trabajo
  const [workSchedule, setWorkSchedule] = useState({
    enabled: true,
    startTime: '08:00',
    endTime: '17:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    workDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    }
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setWorkSchedule(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkDayChange = (day) => {
    setWorkSchedule(prev => ({
      ...prev,
      workDays: { ...prev.workDays, [day]: !prev.workDays[day] }
    }));
  };

  const handleProfilePhoto = (e) => setProfilePhoto(e.target.files[0]);
  const handleMotoPhotos = (e) => setMotoPhotos([...e.target.files]);
  const handleCedulaPhoto = (e) => setCedulaPhoto(e.target.files[0]);
  const handleSeguroPhoto = (e) => setSeguroPhoto(e.target.files[0]);
  const handleLicenciaPhoto = (e) => setLicenciaPhoto(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!profilePhoto) {
      toast.error('Debes subir una foto de perfil');
      return;
    }

    if (motoPhotos.length === 0) {
      toast.error('Debes subir al menos una foto del vehículo');
      return;
    }

    if (!cedulaPhoto) {
      toast.error('Debes subir una foto de la cédula');
      return;
    }

    if (!seguroPhoto) {
      toast.error('Debes subir una foto del seguro');
      return;
    }

    if (!licenciaPhoto) {
      toast.error('Debes subir una foto de la licencia de conducir');
      return;
    }

    setLoading(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('profilePhoto', profilePhoto);
    motoPhotos.forEach(photo => formDataToSend.append('motoPhotos', photo));
    formDataToSend.append('cedulaPhoto', cedulaPhoto);
    formDataToSend.append('seguroPhoto', seguroPhoto);
    formDataToSend.append('licenciaPhoto', licenciaPhoto);
    formDataToSend.append('workSchedule', JSON.stringify(workSchedule));

    try {
      await api.post('/auth/register/mandadito', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('¡Registro exitoso! Recibiste 15 córdobas de crédito.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Logo y cabecera */}
          <div className="bg-gradient-to-br from-[#FF6B35] to-[#4361EE] px-6 pt-8 pb-6 text-center">
            <img src={logo} alt="Pueblo Click" className="w-32 h-auto mx-auto drop-shadow-xl" />
            <h1 className="text-xl font-bold text-white mt-2">Registro Mandadito</h1>
            <p className="text-white/80 text-sm">Únete como repartidor y gana dinero</p>
            <div className="inline-block mt-2 bg-white/20 text-white px-3 py-1 rounded-full text-xs">
              🎁 Crédito inicial: C$15
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Datos personales */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2"><FiUser className="text-[#FF6B35]" /> Datos personales</h3>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Nombre completo" required />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="Teléfono" required />
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="Contraseña" required />
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field" placeholder="Confirmar contraseña" required />
            </div>

            {/* Horario de trabajo */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2"><FiClock className="text-[#FF6B35]" /> Horario de trabajo</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Activar horario</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={workSchedule.enabled} onChange={(e) => setWorkSchedule(prev => ({ ...prev, enabled: e.target.checked }))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF6B35]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                </label>
              </div>

              {workSchedule.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Hora inicio</label><input type="time" name="startTime" value={workSchedule.startTime} onChange={handleScheduleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Hora fin</label><input type="time" name="endTime" value={workSchedule.endTime} onChange={handleScheduleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Inicio almuerzo</label><input type="time" name="lunchStart" value={workSchedule.lunchStart} onChange={handleScheduleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Fin almuerzo</label><input type="time" name="lunchEnd" value={workSchedule.lunchEnd} onChange={handleScheduleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Días de trabajo</label>
                    <div className="flex flex-wrap gap-2">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <button key={day} type="button" onClick={() => handleWorkDayChange(day)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${workSchedule.workDays[day] ? 'bg-[#FF6B35] text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {day === 'monday' ? 'Lun' : day === 'tuesday' ? 'Mar' : day === 'wednesday' ? 'Mié' : day === 'thursday' ? 'Jue' : day === 'friday' ? 'Vie' : day === 'saturday' ? 'Sáb' : 'Dom'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Fotos */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2"><FiCamera className="text-[#FF6B35]" /> Fotos de perfil y vehículo</h3>
              <input type="file" accept="image/*" onChange={handleProfilePhoto} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white" required />
              <input type="file" accept="image/*" multiple onChange={handleMotoPhotos} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4361EE] file:text-white" required />
              <p className="text-xs text-gray-400">{motoPhotos.length} archivo(s) seleccionado(s)</p>
            </div>

            {/* Documentos */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2"><FiFileText className="text-[#FF6B35]" /> Documentos requeridos</h3>
              <input type="file" accept="image/*" onChange={handleCedulaPhoto} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white" required />
              <input type="file" accept="image/*" onChange={handleSeguroPhoto} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-white" required />
              <input type="file" accept="image/*" onChange={handleLicenciaPhoto} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white" required />
            </div>

            {/* Nota */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-start gap-2"><FiInfo className="text-blue-500 mt-0.5" /><p className="text-xs text-blue-700">Tus documentos serán verificados por el administrador antes de que puedas aceptar mandados.</p></div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiUserPlus /> Registrarme como Mandadito</>}
            </button>

            <div className="text-center"><Link to="/login" className="text-sm text-gray-500 hover:text-[#FF6B35] transition-colors flex items-center justify-center gap-1"><FiArrowLeft className="text-xs" /> Volver al inicio de sesión</Link></div>
          </form>
        </div>
      </div>
    </Background>
  );
};

export default RegisterMandadito;