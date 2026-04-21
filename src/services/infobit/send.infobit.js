import api from '@/services/auth';

export const sendMessage = async (numberPhones, message) => {
  const payload = {
    numberPhones,
    message,
  };
  try {
    const res = await api.post('/infobit/send/bulk', payload);
    return res.data;
  } catch (error) {
    console.error('Error function sendMessage:', error);
    throw error;
  }
};
