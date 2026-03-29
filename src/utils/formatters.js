export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'NIO',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusText = (status) => {
  const statusMap = {
    pending: 'Pendiente',
    accepted: 'Aceptado',
    client_completed: 'Completado por cliente',
    mandadito_completed: 'Completado por mandadito',
    finished: 'Finalizado',
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status) => {
  const colorMap = {
    pending: 'badge-pending',
    accepted: 'badge-accepted',
    client_completed: 'badge-completed',
    mandadito_completed: 'badge-completed',
    finished: 'badge-finished',
  };
  return colorMap[status] || 'badge-pending';
};