import api from '@/services/auth';

export const createUser = async (payload) => {
  try {
    const response = await api.post('/users/create', payload);
    return await response.data;
  } catch (error) {
    console.error('Error function createUser:', error);
    throw error;
  }
};
