import api from './api';

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (name, email, password, role, departmentId) => {
  const response = await api.post('/auth/register', { name, email, password, role, departmentId });
  return response.data;
};

export const fetchDepartmentsList = async () => {
  const response = await api.get('/departments');
  return response.data;
};
