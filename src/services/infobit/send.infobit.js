import api from '@/services/auth';

export const sendMessage = async (numberPhone, message) => {
  const payload = {
    numberPhone,
    message,
  };
  try {
    const res = await api.post('/infobit/send', payload);
    return res.data;
  } catch (error) {
    console.error('Error function sendMessage:', error);
    throw error;
  }
};
