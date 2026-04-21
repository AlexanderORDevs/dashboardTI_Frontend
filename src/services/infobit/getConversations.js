import api from '@/services/auth';

export const getConversations = async () => {
  try {
    const res = await api.get('/infobit/conversations');
    return res.data;
  } catch (error) {
    console.error('Error function getConversations:', error);
    throw error;
  }
};
