import api from '@/services/auth';

export const getAllUsers = async () => {
  try {
    const res = await api.get('/users/all');
    return res.data;
  } catch (error) {
    console.error('Error function getAllUsers:', error);
    throw error;
  }
};
