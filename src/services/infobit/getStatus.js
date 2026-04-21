import api from '@/services/auth';

export const getMessageStatus = async (messageId) => {
  try {
    const res = await api.get(`/infobit/status/${messageId}`);
    return res.data;
  } catch (error) {
    console.error('Error function getMessageStatus:', error);
    throw error;
  }
};
