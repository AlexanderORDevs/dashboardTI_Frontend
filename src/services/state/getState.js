import api from '@/services/auth';

export const getAllState = async () => {
  try {
    const res = await api.get(`/state/all`);
    return res.data;
  } catch (error) {
    console.error('Error function getAllState:', error);
    throw error;
  }
};
