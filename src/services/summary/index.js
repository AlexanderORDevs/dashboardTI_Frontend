import api from '@/services/auth';

export const summary = async () => {
  try {
    const res = await api.get(`/summary`);
    return res.data;
  } catch (error) {
    console.error('Error function summary:', error);
    throw error;
  }
};
