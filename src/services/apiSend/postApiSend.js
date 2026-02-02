import api from '@/services/auth';

export const postApiSend = async (payload) => {
  try {
    const response = await api.post(`/api/post`, payload);
    return response.data;
  } catch (error) {
    console.error('Error function postApiSend:', error);
    throw error;
  }
};
