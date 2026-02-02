import api from '@/services/auth';

export const getAllMessages = async () => {
  try {
    const res = await api.get(`/infobit/log`);
    return res.data;
  } catch (error) {
    console.error('Error function getAllMessages:', error);
    throw error;
  }
};
