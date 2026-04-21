import api from '@/services/auth';

export const getConversationHistory = async (numberPhone, limit = 200) => {
  try {
    const res = await api.get(`/infobit/conversations/${numberPhone}/history`, {
      params: { limit },
    });
    return res.data;
  } catch (error) {
    console.error('Error function getConversationHistory:', error);
    throw error;
  }
};
