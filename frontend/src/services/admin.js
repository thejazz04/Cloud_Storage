import api from './api';

export const fetchAuditLogs = async (userId = '', action = '') => {
  let url = '/audit';
  const params = [];
  if (userId) params.push(`userId=${encodeURIComponent(userId)}`);
  if (action) params.push(`action=${encodeURIComponent(action)}`);
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const fetchUsersList = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const updateUserRoleAndDept = async (userId, role, departmentId) => {
  const response = await api.post('/users', { id: userId, role, departmentId });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

export const createDepartment = async (name) => {
  const response = await api.post('/departments', { name });
  return response.data;
};
