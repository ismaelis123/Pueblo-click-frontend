import React, { useState, useEffect } from 'react';
import { FiUser, FiUserX, FiUserCheck, FiTrash2, FiPhone, FiMail, FiLoader } from 'react-icons/fi';
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
      toast.success('Usuario bloqueado');
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
      toast.success('Usuario desbloqueado');
      fetchUsers();
    } catch (error) {
      toast.error('Error al desbloquear usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de eliminar a ${userName}? Esta acción no se puede deshacer.`)) return;
    
    setActionLoading(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Usuario eliminado');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 pb-20 md:pb-8">
      <h1 className="text-2xl font-bold text-text mb-6">Gestión de Usuarios</h1>
      
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2">Usuario</th>
              <th className="text-left py-3 px-2">Teléfono</th>
              <th className="text-left py-3 px-2">Rol</th>
              <th className="text-left py-3 px-2">Estado</th>
              <th className="text-left py-3 px-2">Registro</th>
              <th className="text-left py-3 px-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="text-primary" />
                      )}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    <FiPhone className="text-xs text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className={`badge ${user.role === 'admin' ? 'badge-finished' : user.role === 'mandadito' ? 'badge-accepted' : 'badge-pending'}`}>
                    {user.role === 'client' ? 'Cliente' : user.role === 'mandadito' ? 'Mandadito' : 'Admin'}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className={`badge ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Activo' : 'Bloqueado'}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-2">
                    {user.role !== 'admin' && (
                      <>
                        {user.isActive ? (
                          <button
                            onClick={() => handleBlockUser(user._id)}
                            disabled={actionLoading === user._id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Bloquear"
                          >
                            {actionLoading === user._id ? <FiLoader className="animate-spin" /> : <FiUserX />}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnblockUser(user._id)}
                            disabled={actionLoading === user._id}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                            title="Desbloquear"
                          >
                            {actionLoading === user._id ? <FiLoader className="animate-spin" /> : <FiUserCheck />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          disabled={actionLoading === user._id}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          {actionLoading === user._id ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList;