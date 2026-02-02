import api from '@/services/auth';

export const getCurrentUser = async () => {
  try {
    const res = await api.get('/auth/validateUser');
    const data = res.data;
    return data.user || data;
  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    throw error;
  }
};
