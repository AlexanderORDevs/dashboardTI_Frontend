import api from '@/services/auth';

export const getAllAgents = async () => {
  try {
    const res = await api.get('/agents/all');
    return res.data;
  } catch (error) {
    console.error('Error function getAllAgents:', error);
    throw error;
  }
};
