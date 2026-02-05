import api from '@/services/auth';

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  console.log('successful login');
  return res.data;
};
