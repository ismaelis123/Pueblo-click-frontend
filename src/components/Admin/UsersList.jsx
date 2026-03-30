import React, { useState, useEffect } from 'react';
import { FiUser, FiUserX, FiUserCheck, FiTrash2, FiPhone, FiLoader } from 'react-icons/fi';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/block`);
      toast.success('Usuario bloqueado exitosamente');
      fetchUsers();
    } catch (error) {
      toast.error('Error al bloquear usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockUser = async (userId) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/unblock`);
      toast.success('Usuario desbloqueado exitosamente');
      fetchUsers();
    } catch (error) {
      toast.error('Error al desbloquear usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de eliminar a ${userName}? Esta acción es irreversible.`)) return;

    setActionLoading(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Usuario eliminado exitosamente');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-dark mb-8">Gestión de Usuarios</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Usuario</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Teléfono</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Rol</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Registrado</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden border border-white">
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <FiUser className="text-2xl text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-dark">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email || 'Sin email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiPhone className="text-gray-400" />
                      {user.phone}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                        user.role === 'mandadito' ? 'bg-secondary/10 text-secondary' : 
                        'bg-primary/10 text-primary'}`}>
                      {user.role === 'client' ? 'Cliente' : 
                       user.role === 'mandadito' ? 'Mandadito' : 'Administrador'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                      ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Activo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {user.role !== 'admin' && (
                      <div className="flex gap-2 justify-end">
                        {user.isActive ? (
                          <button
                            onClick={() => handleBlockUser(user._id)}
                            disabled={actionLoading === user._id}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Bloquear usuario"
                          >
                            {actionLoading === user._id ? <FiLoader className="animate-spin" /> : <FiUserX size={20} />}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnblockUser(user._id)}
                            disabled={actionLoading === user._id}
                            className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                            title="Desbloquear usuario"
                          >
                            {actionLoading === user._id ? <FiLoader className="animate-spin" /> : <FiUserCheck size={20} />}
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          disabled={actionLoading === user._id}
                          className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Eliminar usuario"
                        >
                          {actionLoading === user._id ? <FiLoader className="animate-spin" /> : <FiTrash2 size={20} />}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay usuarios registrados todavía
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;