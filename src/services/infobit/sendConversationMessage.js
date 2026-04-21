import api from '@/services/auth';

export const sendConversationMessage = async (numberPhone, message) => {
  try {
    const res = await api.post(`/infobit/conversations/${numberPhone}/send`, {
      message,
    });
    return res.data;
  } catch (error) {
    console.error('Error function sendConversationMessage:', error);
    throw error;
  }
};
