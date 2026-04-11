import React, { useState, useEffect } from 'react';
import { FiClock, FiSave, FiCalendar, FiCoffee, FiInfo } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Common/LoadingSpinner';
import Background from '../Layout/Background';

const WorkSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState({
    enabled: true,
    startTime: '08:00',
    endTime: '17:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    workDays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false }
  });

  useEffect(() => { fetchSchedule(); }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/mandadito/profile');
      if (response.data.workSchedule) setSchedule(response.data.workSchedule);
    } catch (error) { toast.error('Error al cargar horario'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setSchedule(prev => ({ ...prev, [name]: checked }));
    } else {
      setSchedule(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleWorkDayChange = (day) => {
    setSchedule(prev => ({ ...prev, workDays: { ...prev.workDays, [day]: !prev.workDays[day] } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/mandadito/schedule', schedule);
      toast.success('Horario actualizado correctamente');
    } catch (error) { toast.error(error.response?.data?.message || 'Error al actualizar horario'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Background>
      <div className="container mx-auto py-8 px-4 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6"><h1 className="text-2xl font-bold text-gray-800">Configurar Horario</h1><p className="text-gray-500 text-sm mt-1">Define tu disponibilidad para recibir mandados</p></div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div><h3 className="font-semibold text-gray-800 flex items-center gap-2"><FiClock className="text-[#FF6B35]" /> Horario laboral</h3><p className="text-sm text-gray-500">Activa para que tu disponibilidad se ajuste automáticamente</p></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="enabled" checked={schedule.enabled} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF6B35]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                </label>
              </div>
              {schedule.enabled && (
                <>
                  <div className="border border-gray-100 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiClock className="text-[#FF6B35]" /> Horario laboral</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Hora de inicio</label><input type="time" name="startTime" value={schedule.startTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Hora de fin</label><input type="time" name="endTime" value={schedule.endTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]" /></div>
                    </div>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiCoffee className="text-[#FF6B35]" /> Horario de almuerzo</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Inicio almuerzo</label><input type="time" name="lunchStart" value={schedule.lunchStart} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Fin almuerzo</label><input type="time" name="lunchEnd" value={schedule.lunchEnd} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]" /></div>
                    </div>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiCalendar className="text-[#FF6B35]" /> Días de trabajo</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(schedule.workDays).map(([day, enabled]) => (
                        <button key={day} type="button" onClick={() => handleWorkDayChange(day)} className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${enabled ? 'bg-[#FF6B35] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {day === 'monday' ? 'Lun' : day === 'tuesday' ? 'Mar' : day === 'wednesday' ? 'Mié' : day === 'thursday' ? 'Jue' : day === 'friday' ? 'Vie' : day === 'saturday' ? 'Sáb' : 'Dom'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div className="bg-blue-50 rounded-xl p-4"><div className="flex items-start gap-2"><FiInfo className="text-blue-500 mt-0.5" /><p className="text-xs text-blue-700">Tu disponibilidad se actualizará automáticamente según el horario configurado. Durante el almuerzo, no recibirás notificaciones de nuevos mandados.</p></div></div>
              <button type="submit" disabled={saving} className="w-full btn-primary py-3 flex items-center justify-center gap-2">{saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave /> Guardar horario</>}</button>
            </form>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default WorkSchedule;